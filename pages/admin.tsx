import Head from "next/head";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import MatchHistoryLastChecked from "../components/matchhistoryLastChecked";

const Admin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const checkMatchHistory = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch("/api/check-user-matchhistory");
      if (!response.ok) {
        setIsError(true);
      } else {
        setRefreshKey((k) => k + 1);
      }
    } catch {
      setIsError(true);
    }
    setIsLoading(false);
  };

  const resetCheckTimes = async () => {
    setIsResetting(true);
    await fetch("/api/reset-check-times");
    setIsResetting(false);
  };

  return (
    <>
      <Head>
        <title>Admin — Quit League</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ maxWidth: 640, mx: "auto", px: { xs: 2, sm: 3 }, pt: 5, pb: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, letterSpacing: "-0.03em" }}>
          Admin
        </Typography>

        <Box sx={{ mb: 3 }}>
          <MatchHistoryLastChecked key={refreshKey} />
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            onClick={checkMatchHistory}
            color="primary"
            variant="contained"
            disabled={isLoading}
            sx={{ py: 1.2, px: 3 }}
          >
            {isLoading ? "Checking…" : "Check match history"}
          </Button>
          <Button
            onClick={resetCheckTimes}
            variant="outlined"
            disabled={isResetting}
            sx={{
              py: 1.2,
              px: 3,
              borderColor: "rgba(255,255,255,0.15)",
              color: "text.secondary",
              "&:hover": { borderColor: "rgba(255,255,255,0.3)", color: "text.primary" },
            }}
          >
            {isResetting ? "Resetting…" : "Reset check times"}
          </Button>
        </Box>

        {isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error checking match history.
          </Alert>
        )}
      </Box>
    </>
  );
};

export default Admin;
