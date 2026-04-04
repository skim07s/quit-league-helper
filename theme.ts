import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0a0a0a",
      paper: "#111827",
    },
    primary: {
      main: "#ec407a",
    },
    secondary: {
      main: "#11cb5f",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0a0a0a",
          scrollbarWidth: "thin",
          scrollbarColor: "#334155 transparent",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#111827",
          border: "1px solid rgba(255,255,255,0.07)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 500,
          fontSize: "0.875rem",
          padding: "6px 16px",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #ec407a, #d81b60)",
          boxShadow: "0 4px 14px rgba(236,64,122,0.35)",
          "&:hover": {
            background: "linear-gradient(135deg, #f06292, #ec407a)",
            boxShadow: "0 6px 20px rgba(236,64,122,0.45)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "rgba(255,255,255,0.03)",
            "& fieldset": {
              borderColor: "rgba(255,255,255,0.12)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255,255,255,0.25)",
            },
          },
        },
      },
    },
  },
});

export default theme;
