import Head from "next/head";
import { useState } from "react";
import Button from "@mui/material/Button";
import MatchHistoryLastChecked from "../components/matchhistoryLastChecked";

const Admin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const checkMatchHistory = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch("/api/check-user-matchhistory");
      if (!response.ok) {
        setIsError(true);
      }
    } catch {
      setIsError(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="container">
      <Head>
        <title>Admin</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="sectionTitle">Admin</h1>
        <MatchHistoryLastChecked />

        <Button
          onClick={checkMatchHistory}
          color="primary"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? "Checking..." : "Check match history"}
        </Button>

        {isError && <p>Error checking match history</p>}
      </main>

      <style jsx>{`
        .sectionTitle {
          font-size: 50px;
          margin-bottom: 5px;
        }
        .container {
          margin-right: auto;
          margin-left: auto;
          max-width: 960px;
          padding-right: 10px;
          padding-left: 10px;
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

export default Admin;
