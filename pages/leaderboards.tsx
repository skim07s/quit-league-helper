import Head from "next/head";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import prisma from "../lib/prisma";
import BuildLeaderboardButton from "../components/buildLeaderboardButton";
import LeaderboardSummary from "../components/leaderboardSummary";
import { CustomLeaderboard, User, UserCustomLeaderboard } from "@prisma/client";

type LeaderboardWithMembers = CustomLeaderboard & {
  UserCustomLeaderboard: (UserCustomLeaderboard & {
    user: User;
  })[];
};

interface Props {
  leaderboards: LeaderboardWithMembers[];
}

function Leaderboard({ leaderboards }: Props) {
  const [searchValue, setSearchValue] = useState("");
  const filteredLeaderboards = leaderboards.filter((lb) =>
    lb.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Leaderboards — Quit League</title>
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
          sx={{ fontWeight: 700, mb: 3, letterSpacing: "-0.03em" }}
        >
          Leaderboards
        </Typography>

        <Box sx={{ mb: 3 }}>
          <BuildLeaderboardButton />
        </Box>

        <TextField
          label="Search leaderboards"
          variant="outlined"
          size="small"
          fullWidth
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{ mb: 3, maxWidth: 360 }}
        />

        {!filteredLeaderboards.length && (
          <Typography sx={{ color: "text.secondary" }}>
            No leaderboards found.
          </Typography>
        )}
        {filteredLeaderboards.map((leaderboard, i) => (
          <LeaderboardSummary leaderboard={leaderboard} key={i} />
        ))}
      </Box>
    </>
  );
}

export async function getStaticProps() {
  const leaderboards = await prisma.customLeaderboard.findMany({
    orderBy: { id: "desc" },
    include: {
      UserCustomLeaderboard: {
        include: {
          user: {
            select: {
              summonerNames: true,
              currentStreak: true,
              name: true,
              longestStreak: true,
            },
          },
        },
      },
    },
  });

  return {
    props: { leaderboards },
    revalidate: 1,
  };
}

export default Leaderboard;
