import Head from "next/head";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LeaderBoardRow from "../components/leaderboard/leaderBoardRow";
import prisma from "../lib/prisma";
import { User } from "@prisma/client";
import BuildLeaderboardButton from "../components/buildLeaderboardButton";
import MatchHistoryLastChecked from "../components/matchhistoryLastChecked";

interface Props {
  topUsers: User[];
}

function Leaderboard({ topUsers }: Props) {
  return (
    <>
      <Head>
        <title>Global Leaderboard — Quit League</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        sx={{
          maxWidth: 760,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          pt: 5,
          pb: 8,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 0.5, letterSpacing: "-0.03em" }}
        >
          Global Leaderboard
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <MatchHistoryLastChecked />
        </Box>

        <Box sx={{ mb: 3 }}>
          <BuildLeaderboardButton />
        </Box>

        {topUsers.map((user, index) => (
          <LeaderBoardRow user={user} key={user.name} rank={index + 1} />
        ))}
      </Box>
    </>
  );
}

export async function getStaticProps() {
  const users = await prisma.user.findMany({
    take: 100,
    select: {
      summonerNames: true,
      currentStreak: true,
      name: true,
      longestStreak: true,
    },
    orderBy: {
      currentStreak: "desc",
    },
  });

  return {
    props: { topUsers: users },
    revalidate: 1,
  };
}

export default Leaderboard;
