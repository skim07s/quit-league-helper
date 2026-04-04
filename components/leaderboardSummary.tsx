import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import {
  CustomLeaderboard,
  User,
  UserCustomLeaderboard,
} from "@prisma/client";

interface Props {
  leaderboard: CustomLeaderboard & {
    UserCustomLeaderboard: (UserCustomLeaderboard & {
      user: User;
    })[];
  };
}

function LeaderboardSummary({ leaderboard }: Props) {
  let currentLeader: User | null = null;
  for (const item of leaderboard.UserCustomLeaderboard) {
    if (
      currentLeader == null ||
      item.user.currentStreak > currentLeader.currentStreak
    ) {
      currentLeader = item.user;
    }
  }

  const members = leaderboard.UserCustomLeaderboard.map((i) => i.user.name).join(", ");

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        p: 2.5,
        transition: "border-color 0.2s, transform 0.2s",
        "&:hover": {
          borderColor: "rgba(255,255,255,0.14)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", mb: 0.5 }}>
        {leaderboard.name}
      </Typography>
      <Typography sx={{ fontSize: "0.82rem", color: "text.secondary", mb: 0.5 }}>
        {members}
      </Typography>
      {currentLeader && (
        <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1.5 }}>
          Leading:{" "}
          <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
            {currentLeader.name}
          </Box>{" "}
          — {currentLeader.currentStreak}d without League
        </Typography>
      )}
      <Link href={"/leaderboard/" + encodeURI(leaderboard.name)} passHref legacyBehavior>
        <Button
          component="a"
          size="small"
          variant="outlined"
          sx={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "text.secondary",
            fontSize: "0.78rem",
            "&:hover": { borderColor: "rgba(255,255,255,0.35)", color: "text.primary" },
          }}
        >
          View leaderboard →
        </Button>
      </Link>
    </Paper>
  );
}

export default LeaderboardSummary;
