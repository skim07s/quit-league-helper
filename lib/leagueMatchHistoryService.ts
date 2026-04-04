import prisma from "./prisma";

const { LEAGUE_API_KEY } = process.env;

const riotFetch = (url: string) =>
  fetch(url, {
    headers: { "X-Riot-Token": LEAGUE_API_KEY ?? "" },
    signal: AbortSignal.timeout(5000),
  });

const checkIfUsersArePlaying = async () => {
  // Only get users that have not been updated in the last 24 hours.
  // This handles the case where the function times out mid-run, allowing
  // it to continue from where it left off on the next execution.
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24);

  const users = await prisma.user.findMany({
    where: {
      lastModifiedTime: {
        lt: cutoff,
      },
    },
    include: {
      UserLeagueAccount: {
        include: {
          LeagueAccount: true,
        },
      },
    },
  });

  for (const user of users) {
    let latestDatePlayed: Date | null = null;
    let lastAccountPlayedOn: string | null = null;

    for (const userLeagueAccount of user.UserLeagueAccount) {
      if (userLeagueAccount.LeagueAccount.isInvalid) {
        continue;
      }

      const summonerName = userLeagueAccount.LeagueAccount.summonerName;
      let accountPuuid = userLeagueAccount.LeagueAccount.puuid;

      if (accountPuuid == null) {
        try {
          const uri = encodeURI(
            "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
              summonerName
          );
          const summonerRes = await riotFetch(uri);
          if (!summonerRes.ok) {
            if (summonerRes.status === 404) {
              console.log(
                `[INFO] Setting ${summonerName} to isInvalid — summoner name does not exist`
              );
              await prisma.leagueAccount.update({
                where: { id: userLeagueAccount.LeagueAccount.id },
                data: { isInvalid: true },
              });
            } else {
              console.log(
                `[WARNING] Could not get summoner puuid for ${summonerName}. Status: ${summonerRes.status}`
              );
            }
            continue;
          }
          const summonerData = await summonerRes.json();
          accountPuuid = summonerData.puuid;
          await prisma.leagueAccount.update({
            where: { id: userLeagueAccount.LeagueAccount.id },
            data: { puuid: accountPuuid },
          });
        } catch (error) {
          console.log(
            `[WARNING] Could not reach Riot API for summoner ${summonerName}:`,
            error
          );
          continue;
        }
      }

      let lastGameOnAccount: Date | null = null;
      try {
        const matchListRes = await riotFetch(
          `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountPuuid}/ids?start=0&count=20`
        );
        if (!matchListRes.ok) {
          if (matchListRes.status === 404) {
            console.log(
              `[INFO] Setting ${summonerName} to isInvalid — no match history`
            );
            await prisma.leagueAccount.update({
              where: { id: userLeagueAccount.LeagueAccount.id },
              data: { isInvalid: true },
            });
          } else {
            console.log(
              `[WARNING] Could not get match list for ${summonerName}. Status: ${matchListRes.status}`
            );
          }
          continue;
        }
        const matchIds: string[] = await matchListRes.json();
        const lastMatchId = matchIds[0];

        const matchRes = await riotFetch(
          `https://americas.api.riotgames.com/lol/match/v5/matches/${lastMatchId}`
        );
        if (!matchRes.ok) {
          console.log(
            `[WARNING] Could not get match data for ${summonerName}. Status: ${matchRes.status}`
          );
          continue;
        }
        const matchData = await matchRes.json();
        lastGameOnAccount = new Date(matchData.info.gameCreation);
      } catch (error) {
        console.log(
          `[WARNING] Could not get match history for ${summonerName}:`,
          error
        );
        continue;
      }

      if (lastGameOnAccount == null) {
        continue;
      }

      if (latestDatePlayed === null || lastGameOnAccount > latestDatePlayed) {
        latestDatePlayed = lastGameOnAccount;
        lastAccountPlayedOn = summonerName;
      }
    }

    if (latestDatePlayed === null) {
      console.log(`[INFO] User: ${user.name} does not have a valid account.`);
      continue;
    }

    console.log(
      `[INFO] User: ${user.name} played their last game on ${latestDatePlayed} (with ${lastAccountPlayedOn}).`
    );

    const differenceInTime = new Date().getTime() - latestDatePlayed.getTime();
    const daysSinceLastGame = Math.floor(
      differenceInTime / (1000 * 3600 * 24)
    );
    const longestStreakForUser = Math.max(
      daysSinceLastGame,
      user.longestStreak
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        currentStreak: daysSinceLastGame,
        longestStreak: longestStreakForUser,
        lastModifiedTime: new Date(),
      },
    });
  }

  await prisma.matchHistoryServiceAudit.create({
    data: {},
  });
};

export { checkIfUsersArePlaying };
