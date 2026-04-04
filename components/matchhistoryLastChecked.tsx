import { formatRelative } from "date-fns";
import { useEffect, useState } from "react";

const MatchHistoryLastChecked = () => {
  const [lastChecked, setLastChecked] = useState("Loading...");

  useEffect(() => {
    async function getLastMatchHistoryCheck() {
      const response = await fetch("/api/last-matchhistory-check");
      const data = await response.json();
      const lastMatchHistoryCheckDate = new Date(data.date);
      setLastChecked(formatRelative(lastMatchHistoryCheckDate, new Date()));
    }
    getLastMatchHistoryCheck();
  }, []);

  return (
    <p
      style={{
        color: "#b1afaf",
        margin: 0,
        padding: 0,
        marginBottom: 3,
        marginLeft: 5,
      }}
    >
      Last checked: {lastChecked}
    </p>
  );
};

export default MatchHistoryLastChecked;
