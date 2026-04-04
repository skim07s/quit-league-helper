import Head from "next/head";
import { useState } from "react";
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
  const filteredLeaderboards = leaderboards.filter((leaderboard) =>
    leaderboard.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="container">
      <Head>
        <title>Leaderboards</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="sectionTitle">Leaderboards</h1>

        <BuildLeaderboardButton />

        <TextField
          label="Search leaderboards"
          variant="standard"
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ marginTop: 0, paddingTop: 0, marginBottom: 10 }}
        />

        {!filteredLeaderboards.length && "No leaderboards found."}
        {filteredLeaderboards.map((leaderboard, i) => (
          <LeaderboardSummary leaderboard={leaderboard} key={i} />
        ))}
      </main>

      <style jsx>{`
        .container {
          margin-right: auto;
          margin-left: auto;
          max-width: 960px;
          padding-right: 10px;
          padding-left: 10px;
        }

        .sectionTitle {
          font-size: 50px;
          margin-bottom: 5px;
        }

        @media only screen and (max-width: 600px) {
          .sectionTitle {
            font-size: 35px;
          }
        }

        a {
          color: white !important;
          text-decoration: none !important;
        }
        body {
          background-color: rgba(0, 0, 0, 1) !important;
        }
      `}</style>
    </div>
  );
}

export async function getStaticProps() {
  const leaderboards = await prisma.customLeaderboard.findMany({
    orderBy: {
      id: "desc",
    },
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
