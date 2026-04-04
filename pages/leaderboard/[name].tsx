import { useRouter } from "next/router";
import Head from "next/head";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LeaderBoardRow from "../../components/leaderboard/leaderBoardRow";
import Error from "next/error";
import { User } from "@prisma/client";
import prisma from "../../lib/prisma";
import MatchHistoryLastChecked from "../../components/matchhistoryLastChecked";

interface Props {
  users: User[] | null;
}

function Leaderboard({ users }: Props) {
  const router = useRouter();
  const { name } = router.query;

  if (users == null) {
    return <Error statusCode={404} />;
  }

  return (
    <>
      <Head>
        <title>{name} — Quit League</title>
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
          {name}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <MatchHistoryLastChecked />
        </Box>

        {users.map((user, index) => (
          <LeaderBoardRow user={user} key={user.name} rank={index + 1} />
        ))}
      </Box>
    </>
  );
}

export async function getServerSideProps(context: {
  params: { name: string };
}) {
  const { name } = context.params;

  const leaderboard = await prisma.customLeaderboard.findFirst({
    where: { name },
    select: {
      UserCustomLeaderboard: {
        select: { user: true },
      },
    },
  });

  if (!leaderboard) {
    return { props: { users: null } };
  }

  const users = leaderboard.UserCustomLeaderboard.map((item) => item.user);
  users.sort((a, b) => b.currentStreak - a.currentStreak);

  return { props: { users } };
}

export default Leaderboard;
