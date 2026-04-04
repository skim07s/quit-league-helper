import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await prisma.user.updateMany({
    data: { lastModifiedTime: new Date(0) },
  });
  return res.json({ status: "success" });
}
