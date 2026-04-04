import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "rgba(0, 0, 0, 1)",
    },
    primary: {
      main: "#ec407a",
    },
    secondary: {
      main: "#11cb5f",
    },
  },
});

export default theme;
