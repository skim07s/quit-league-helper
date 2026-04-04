import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { containsProfanity, findProfanity } from "../../../lib/profanity";

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
    return res.status(400).json({ error: "Leaderboard name contains inappropriate content." });
  }
  const profaneNames = findProfanity(summonerNames);
  if (profaneNames.length > 0) {
    return res.status(400).json({
      error: "Riot ID contains inappropriate content.",
      summonerNamesNotFound: profaneNames,
    });
  }

  const userIds: number[] = [];
  const summonerNamesNotFound: string[] = [];

  for (const summonerName of summonerNames) {
    console.log("looking for summoner name: ", summonerName);
    const user = await prisma.user.findFirst({
      where: {
        summonerNames: {
          has: summonerName,
        },
      },
    });

    if (user != null) {
      userIds.push(+user.id);
    } else {
      summonerNamesNotFound.push(summonerName);
    }
  }

  if (summonerNamesNotFound.length > 0) {
    return res
      .status(400)
      .json({ error: "Invalid summoner names.", summonerNamesNotFound });
  }

  const numLeaderboardsAlreadyWithThisName =
    await prisma.customLeaderboard.count({
      where: { name: req.body.name },
    });

  if (numLeaderboardsAlreadyWithThisName !== 0) {
    return res
      .status(409)
      .json({ error: "Leaderboard with that name already exists." });
  }

  const newLeaderboard = await prisma.customLeaderboard.create({
    data: {
      name: req.body.name,
      UserCustomLeaderboard: {
        create: userIds.map((userId) => ({ userId })),
      },
    },
  });

  return res.json({ newLeaderboard });
}
