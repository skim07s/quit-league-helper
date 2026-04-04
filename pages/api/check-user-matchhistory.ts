import { NextApiRequest, NextApiResponse } from "next";
import { checkIfUsersArePlaying } from "../../lib/leagueMatchHistoryService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await checkIfUsersArePlaying();
  return res.json({ status: "success" });
}
