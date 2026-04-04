import prisma from "./prisma";

const { LEAGUE_API_KEY } = process.env;

const log = (level: "INFO" | "WARN" | "ERROR", msg: string) =>
  console.log(`[${new Date().toISOString()}] [${level}] ${msg}`);

const riotFetch = (url: string) =>
  fetch(url, {
    headers: { "X-Riot-Token": LEAGUE_API_KEY ?? "" },
    signal: AbortSignal.timeout(5000),
  });

const checkIfUsersArePlaying = async () => {
  log("INFO", "=== Match history check started ===");

  if (!LEAGUE_API_KEY) {
    log("ERROR", "LEAGUE_API_KEY is not set — aborting");
    return;
  }

  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24);
  log("INFO", `Cutoff time (24h ago): ${cutoff.toISOString()}`);

  const users = await prisma.user.findMany({
    where: { lastModifiedTime: { lt: cutoff } },
    include: {
      UserLeagueAccount: {
        include: { LeagueAccount: true },
      },
    },
  });

  log("INFO", `Found ${users.length} user(s) due for a check`);

  if (users.length === 0) {
    log("INFO", "No users to check — all were updated within the last 24h");
  }

  for (const user of users) {
    log("INFO", `--- Checking user: ${user.name} (id=${user.id})`);
    log(
      "INFO",
      `  lastModifiedTime: ${user.lastModifiedTime.toISOString()}, accounts: ${user.UserLeagueAccount.length}`
    );

    let latestDatePlayed: Date | null = null;
    let lastAccountPlayedOn: string | null = null;

    for (const userLeagueAccount of user.UserLeagueAccount) {
      const account = userLeagueAccount.LeagueAccount;
      const summonerName = account.summonerName;

      if (account.isInvalid) {
        log("INFO", `  [${summonerName}] skipped — marked invalid`);
        continue;
      }

      log("INFO", `  [${summonerName}] checking (puuid=${account.puuid ?? "none yet"})`);

      let accountPuuid = account.puuid;

      // Fetch PUUID if not cached — uses account-v1 (Riot ID: "gameName#tagLine")
      if (accountPuuid == null) {
        log("INFO", `  [${summonerName}] fetching PUUID from Riot...`);
        const hashIndex = summonerName.indexOf("#");
        if (hashIndex === -1) {
          log("WARN", `  [${summonerName}] not a valid Riot ID (expected "gameName#tagLine") — skipping`);
          continue;
        }
        const gameName = summonerName.slice(0, hashIndex);
        const tagLine = summonerName.slice(hashIndex + 1);
        try {
          const uri = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
          const accountRes = await riotFetch(uri);
          log("INFO", `  [${summonerName}] account lookup → HTTP ${accountRes.status}`);

          if (!accountRes.ok) {
            if (accountRes.status === 404) {
              log("INFO", `  [${summonerName}] not found on Riot — marking invalid`);
              await prisma.leagueAccount.update({
                where: { id: account.id },
                data: { isInvalid: true },
              });
            } else if (accountRes.status === 403 || accountRes.status === 401) {
              log("ERROR", `  [${summonerName}] ${accountRes.status} — API key is missing, expired, or lacks account-v1 access`);
            } else {
              log("WARN", `  [${summonerName}] unexpected status ${accountRes.status}`);
            }
            continue;
          }

          const accountData = await accountRes.json();
          accountPuuid = accountData.puuid;
          log("INFO", `  [${summonerName}] got PUUID: ${accountPuuid}`);
          await prisma.leagueAccount.update({
            where: { id: account.id },
            data: { puuid: accountPuuid },
          });
        } catch (error) {
          log("ERROR", `  [${summonerName}] failed to reach Riot API: ${error}`);
          continue;
        }
      }

      // Fetch match history
      log("INFO", `  [${summonerName}] fetching recent match IDs...`);
      let lastGameOnAccount: Date | null = null;
      try {
        const matchListRes = await riotFetch(
          `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountPuuid}/ids?start=0&count=20`
        );
        log("INFO", `  [${summonerName}] match list → HTTP ${matchListRes.status}`);

        if (!matchListRes.ok) {
          if (matchListRes.status === 404) {
            log("INFO", `  [${summonerName}] no match history — marking invalid`);
            await prisma.leagueAccount.update({
              where: { id: account.id },
              data: { isInvalid: true },
            });
          } else {
            log("WARN", `  [${summonerName}] unexpected status ${matchListRes.status}`);
          }
          continue;
        }

        const matchIds: string[] = await matchListRes.json();
        log("INFO", `  [${summonerName}] found ${matchIds.length} recent match(es), latest: ${matchIds[0]}`);

        const matchRes = await riotFetch(
          `https://americas.api.riotgames.com/lol/match/v5/matches/${matchIds[0]}`
        );
        log("INFO", `  [${summonerName}] match detail → HTTP ${matchRes.status}`);

        if (!matchRes.ok) {
          log("WARN", `  [${summonerName}] could not fetch match detail, status ${matchRes.status}`);
          continue;
        }

        const matchData = await matchRes.json();
        lastGameOnAccount = new Date(matchData.info.gameCreation);
        log("INFO", `  [${summonerName}] last game played: ${lastGameOnAccount.toISOString()}`);
      } catch (error) {
        log("ERROR", `  [${summonerName}] error fetching match history: ${error}`);
        continue;
      }

      if (lastGameOnAccount == null) continue;

      if (latestDatePlayed === null || lastGameOnAccount > latestDatePlayed) {
        latestDatePlayed = lastGameOnAccount;
        lastAccountPlayedOn = summonerName;
      }
    }

    if (latestDatePlayed === null) {
      log("WARN", `  ${user.name}: no valid account found, streak not updated`);
      continue;
    }

    const differenceInTime = new Date().getTime() - latestDatePlayed.getTime();
    const daysSinceLastGame = Math.floor(differenceInTime / (1000 * 3600 * 24));
    const longestStreakForUser = Math.max(daysSinceLastGame, user.longestStreak);

    log(
      "INFO",
      `  ${user.name}: last game ${latestDatePlayed.toISOString()} via [${lastAccountPlayedOn}] → streak = ${daysSinceLastGame}d (best: ${longestStreakForUser}d)`
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

  await prisma.matchHistoryServiceAudit.create({ data: {} });
  log("INFO", "=== Match history check complete ===");
};

export { checkIfUsersArePlaying };
