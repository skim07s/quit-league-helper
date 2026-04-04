import Head from "next/head";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const Home = () => {
  const [name, setName] = useState("");
  const [summonerNames, setSummonerNames] = useState([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [invalidSummonerNames, setInvalidSummonerNames] = useState<string[]>(
    []
  );

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
    <div className="container">
      <Head>
        <title>Quit League</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Want to take a break from</h1>
        <h1 className="LoL">League of Legends?</h1>
        <h2>
          We can help you. Fill out the form below and we will keep track of
          your streak automatically.
        </h2>
        <h3>
          Afterwards you can create custom leaderboards to compete with your
          friends for the longest streak.
        </h3>

        <TextField
          label="Your Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {summonerNames.map((summonerName, i) => (
          <TextField
            key={i}
            label="Summoner Name"
            variant="outlined"
            fullWidth
            style={{ marginTop: 20 }}
            value={summonerName}
            onChange={(e) => handleSummonerNameChange(i, e.target.value)}
          />
        ))}

        <Button
          color="primary"
          onClick={handleAddAccount}
          style={{ marginBottom: 0 }}
        >
          Add another account
        </Button>

        <p style={{ color: "#797272", marginTop: 8, paddingTop: 0 }}>
          Be sure to include all your accounts.
        </p>

        {invalidSummonerNames.length > 0 && (
          <Alert severity="error">
            <AlertTitle>Invalid Summoner Names</AlertTitle>
            {invalidSummonerNames.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          size="large"
          style={{ marginTop: 15 }}
          onClick={handleSignupPress}
          disabled={
            summonerNames.filter((x) => x.trim() !== "").length === 0 ||
            name === ""
          }
        >
          {isLoading ? "Loading..." : "Take a break"}
        </Button>
      </main>

      <style jsx>{`
        .container {
          margin-right: auto;
          margin-left: auto;
          max-width: 960px;
          padding-right: 10px;
          padding-left: 10px;
        }

        h1 {
          font-size: 50px;
          margin-bottom: 0;
          padding-bottom: 0;
          font-weight: 400;
        }

        .LoL {
          font-size: 70px;
          margin-top: 0;
          padding-top: 0;
          margin-bottom: 40px;
          font-weight: 600;
        }

        h2 {
          font-size: 20px;
        }

        @media only screen and (max-width: 600px) {
          h1 {
            font-size: 30px;
          }
          .LoL {
            font-size: 40px;
          }
        }

        a {
          color: white;
          text-decoration: none !important;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          background-color: rgba(0, 0, 0, 1) !important;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default Home;
