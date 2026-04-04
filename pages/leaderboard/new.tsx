import Head from "next/head";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

function BuildCustomLeaderboard() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summonerNames, setSummonerNames] = useState(["", ""]);
  const [summonerNamesNotFound, setSummonerNamesNotFound] = useState<string[]>(
    []
  );
  const [shouldShowLeaderboardNameError, setShouldShowLeaderboardNameError] =
    useState(false);

  const handleCreateButtonPress = async () => {
    setIsLoading(true);
    const summonerNamesToUse = summonerNames.filter((x) => x.trim() !== "");
    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, summonerNames: summonerNamesToUse }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setShouldShowLeaderboardNameError(true);
        }
        if (data.summonerNamesNotFound) {
          setSummonerNamesNotFound(data.summonerNamesNotFound);
        }
      } else {
        setSummonerNamesNotFound([]);
        setShouldShowLeaderboardNameError(false);
        window.location.href = "/leaderboard/" + encodeURI(name);
      }
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  };

  const handleAddUser = () => {
    setSummonerNames((prev) => [...prev, ""]);
  };

  const handleSummonerNameChange = (i: number, summonerName: string) => {
    const newSummonerNames = [...summonerNames];
    newSummonerNames[i] = summonerName;
    setSummonerNames(newSummonerNames);
  };

  return (
    <div className="container">
      <Head>
        <title>Build a Leaderboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="sectionTitle" style={{ marginBottom: 20 }}>
          Build a custom leaderboard
        </h1>
        <TextField
          label="Leaderboard name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          style={{ maxWidth: 800 }}
        />
        <p style={{ marginBottom: 0 }}>
          You can add people to this board by entering in one of their summoner
          names they signed up with (eg. their main account).
        </p>
        {summonerNames.map((summonerName, i) => (
          <TextField
            key={i}
            label="Users summoner name"
            variant="outlined"
            value={summonerName}
            onChange={(e) => handleSummonerNameChange(i, e.target.value)}
            fullWidth
            style={{ maxWidth: 800, marginTop: 20 }}
          />
        ))}
        <Button
          color="primary"
          onClick={handleAddUser}
          style={{ marginBottom: 0, display: "block" }}
        >
          Add another user
        </Button>
        {summonerNamesNotFound.length > 0 && (
          <Alert severity="error" style={{ backgroundColor: "rgb(37 11 10)" }}>
            <AlertTitle>
              Could not find users that signed up the following summoner names:
            </AlertTitle>
            {summonerNamesNotFound.map((n, i) => (
              <p key={i}>{n}</p>
            ))}
          </Alert>
        )}
        {shouldShowLeaderboardNameError && (
          <Alert severity="error" style={{ backgroundColor: "rgb(37 11 10)" }}>
            <AlertTitle>Leaderboard already exists with this name</AlertTitle>
          </Alert>
        )}
        <Button
          variant="contained"
          color="primary"
          size="large"
          style={{ marginTop: 15 }}
          onClick={handleCreateButtonPress}
          disabled={
            summonerNames.filter((x) => x.trim() !== "").length < 2 ||
            name === ""
          }
        >
          {isLoading ? "Loading..." : "Create board"}
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

export default BuildCustomLeaderboard;
