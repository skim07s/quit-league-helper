import { useRouter } from "next/router";
import Head from "next/head";
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
    <div className="container">
      <Head>
        <title>{name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="sectionTitle">{name}</h1>
        <MatchHistoryLastChecked />
        <br />

        {users.map((user) => (
          <LeaderBoardRow user={user} key={user.name} />
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
      `}</style>
    </div>
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
        select: {
          user: true,
        },
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
