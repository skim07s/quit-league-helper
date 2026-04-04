import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

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

  const invalidSummonerNames: string[] = [];

  for (const summonerName of summonerNames) {
    try {
      const response = await fetch(
        "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
          encodeURIComponent(summonerName),
        {
          headers: { "X-Riot-Token": LEAGUE_API_KEY ?? "" },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (response.status === 404) {
        invalidSummonerNames.push(summonerName);
      } else if (!response.ok) {
        console.log(
          "[ERROR] could not validate summoner name because of API error"
        );
      }
    } catch (error) {
      console.log(
        "[ERROR] could not reach Riot API to validate summoner name",
        error
      );
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
    },
  });

  return res.json({ status: "success" });
}
