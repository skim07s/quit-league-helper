import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
import { containsProfanity, findProfanity } from "../../lib/profanity";

const { LEAGUE_API_KEY } = process.env;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    !Object.prototype.hasOwnProperty.call(req.body, "name") ||
    req.body.name == null ||
    req.body.name === "" ||
    !Object.prototype.hasOwnProperty.call(req.body, "summonerNames") ||
    req.body.summonerNames == null
  ) {
    return res
      .status(400)
      .json({ error: "name and summonerNames required in the body." });
  }

  const summonerNames: string[] = (req.body.summonerNames as string[]).filter(
    (x) => x.trim() !== ""
  );
  if (summonerNames.length === 0) {
    return res.status(400).json({
      error: "A valid list of summonerNames is required.",
    });
  }

  // Profanity check
  if (containsProfanity(req.body.name)) {
    return res.status(400).json({ error: "Name contains inappropriate content." });
  }
  const profaneAccounts = findProfanity(summonerNames);
  if (profaneAccounts.length > 0) {
    return res.status(400).json({
      error: "Riot ID contains inappropriate content.",
      invalidSummonerNames: profaneAccounts,
    });
  }

  const invalidSummonerNames: string[] = [];

  for (const summonerName of summonerNames) {
    const hashIndex = summonerName.indexOf("#");
    if (hashIndex === -1) {
      invalidSummonerNames.push(summonerName);
      continue;
    }
    const gameName = summonerName.slice(0, hashIndex);
    const tagLine = summonerName.slice(hashIndex + 1);
    try {
      const response = await fetch(
        `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        {
          headers: { "X-Riot-Token": LEAGUE_API_KEY ?? "" },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (response.status === 404) {
        invalidSummonerNames.push(summonerName);
      } else if (!response.ok) {
        console.log("[ERROR] could not validate Riot ID — API error", response.status);
      }
    } catch (error) {
      console.log("[ERROR] could not reach Riot API to validate Riot ID", error);
    }
  }

  if (invalidSummonerNames.length > 0) {
    return res
      .status(400)
      .json({ error: "Invalid summoner names.", invalidSummonerNames });
  }

  await prisma.user.create({
    data: {
      name: req.body.name,
      currentStreak: 0,
      summonerNames,
      lastModifiedTime: new Date(0), // epoch so they're picked up by the next check
      UserLeagueAccount: {
        create: summonerNames.map((summonerName) => ({
          LeagueAccount: {
            create: { summonerName },
          },
        })),
      },
    },
  });

  return res.json({ status: "success" });
}
