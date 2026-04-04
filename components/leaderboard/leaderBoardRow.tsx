import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { User } from "@prisma/client";

interface Props {
  user: User;
  rank?: number;
}

const rankColors: Record<number, string> = {
  1: "#f59e0b",
  2: "#94a3b8",
  3: "#b45309",
};

export default function LeaderBoardRow({ user, rank }: Props) {
  const accentColor = rank && rank <= 3 ? rankColors[rank] : undefined;

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        overflow: "hidden",
        borderLeft: accentColor
          ? `3px solid ${accentColor}`
          : "1px solid rgba(255,255,255,0.07)",
        transition: "border-color 0.2s, transform 0.2s",
        "&:hover": {
          borderLeftColor: accentColor ?? "rgba(255,255,255,0.18)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "stretch" }}>
        {/* Rank badge */}
        {rank && (
          <Box
            sx={{
              width: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.03)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: rank <= 3 ? "1rem" : "0.8rem",
                color: accentColor ?? "rgba(255,255,255,0.25)",
              }}
            >
              #{rank}
            </Typography>
          </Box>
        )}

        {/* Content */}
        <Box sx={{ p: 2.5, flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 500, fontSize: "0.95rem", mb: 0.5, color: "text.secondary" }}>
            {user.name}
          </Typography>
          <Typography
            sx={{
              fontSize: "1.75rem",
              fontWeight: 700,
              lineHeight: 1.1,
              mb: 1,
              color: "text.primary",
            }}
          >
            {user.currentStreak}{" "}
            <Box component="span" sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
              {user.currentStreak === 1 ? "day" : "days"}
            </Box>{" "}
            <Box
              component="span"
              sx={{ fontSize: "0.95rem", fontWeight: 400, color: "text.secondary" }}
            >
              without League
            </Box>
          </Typography>

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
              Accounts:{" "}
              <Box component="span" sx={{ color: "text.primary", fontWeight: 500 }}>
                {user.summonerNames.join(", ")}
              </Box>
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
              Best streak:{" "}
              <Box
                component="span"
                sx={{ color: accentColor ?? "primary.main", fontWeight: 600 }}
              >
                {user.longestStreak}d
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
