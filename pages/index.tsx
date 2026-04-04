import Head from "next/head";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const Home = () => {
  const [name, setName] = useState("");
  const [summonerNames, setSummonerNames] = useState([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [invalidSummonerNames, setInvalidSummonerNames] = useState<string[]>([]);

  const handleSummonerNameChange = (i: number, summonerName: string) => {
    const newSummonerNames = [...summonerNames];
    newSummonerNames[i] = summonerName;
    setSummonerNames(newSummonerNames);
  };

  const handleAddAccount = () => {
    setSummonerNames((prev) => [...prev, ""]);
  };

  const handleSignupPress = async () => {
    setIsLoading(true);
    const summonerNamesToUse = summonerNames.filter((x) => x.trim() !== "");
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, summonerNames: summonerNamesToUse }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.invalidSummonerNames) {
          setInvalidSummonerNames(data.invalidSummonerNames);
        }
      } else {
        setInvalidSummonerNames([]);
        window.location.href = "/global-leaderboard";
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Quit League</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        sx={{
          maxWidth: 640,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          pt: { xs: 6, sm: 10 },
          pb: 8,
        }}
      >
        {/* Hero */}
        <Typography
          sx={{
            fontSize: { xs: "2.2rem", sm: "3rem" },
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            mb: 0,
            color: "text.secondary",
          }}
        >
          Want to take a break from
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "2.8rem", sm: "4rem" },
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            mb: 3,
            background: "linear-gradient(135deg, #ec407a 0%, #f48fb1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          League of Legends?
        </Typography>

        <Typography sx={{ color: "text.secondary", mb: 0.5, fontSize: "1rem" }}>
          Fill out the form below and we&apos;ll track your streak automatically.
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 4, fontSize: "0.9rem" }}>
          Then create custom leaderboards to compete with friends.
        </Typography>

        {/* Form */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Your name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {summonerNames.map((summonerName, i) => (
            <TextField
              key={i}
              label={`Summoner name${summonerNames.length > 1 ? ` ${i + 1}` : ""}`}
              variant="outlined"
              fullWidth
              value={summonerName}
              onChange={(e) => handleSummonerNameChange(i, e.target.value)}
            />
          ))}

          <Box>
            <Button
              color="primary"
              onClick={handleAddAccount}
              size="small"
              sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
            >
              + Add another account
            </Button>
            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.5, ml: 0.5 }}>
              Be sure to include all your accounts.
            </Typography>
          </Box>

          {invalidSummonerNames.length > 0 && (
            <Alert severity="error">
              <AlertTitle>Invalid summoner names</AlertTitle>
              {invalidSummonerNames.map((n) => (
                <Box key={n}>{n}</Box>
              ))}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSignupPress}
            disabled={
              summonerNames.filter((x) => x.trim() !== "").length === 0 ||
              name === ""
            }
            sx={{ mt: 1, py: 1.5, fontSize: "1rem" }}
          >
            {isLoading ? "Loading…" : "Take a break"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Home;
