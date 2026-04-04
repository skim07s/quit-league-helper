import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

// this is a temp route for a data migration
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const users = await prisma.user.findMany({});
  for (const user of users) {
    for (const summonerName of user.summonerNames) {
      let leagueAccount = null;
      const existingLeagueAccounts = await prisma.leagueAccount.findMany({
        where: {
          summonerName: summonerName,
        },
      });
      if (existingLeagueAccounts.length > 0) {
        leagueAccount = existingLeagueAccounts[0];
      } else {
        leagueAccount = await prisma.leagueAccount.create({
          data: {
            summonerName: summonerName,
          },
        });
      }

      await prisma.userLeagueAccount.create({
        data: {
          leagueAccountId: leagueAccount.id,
          userId: user.id,
        },
      });
    }
  }

  return res.json({ status: "success" });
}
