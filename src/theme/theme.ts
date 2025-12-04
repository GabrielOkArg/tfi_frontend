import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "rgba(0, 0, 0, 1)", // lila
    },
    background: {
      default: "#000", // negro
      paper: "#111",
    },
    text: {
      primary: "#fff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-input": {
            color: "#fff",
          },
          "& .MuiOutlinedInput-input::placeholder": {
            color: "rgba(255, 255, 255, 0.5)",
            opacity: 1,
          },
          "& input[type='date']": {
            color: "#fff",
            colorScheme: "dark",
          },
          "& input[type='date']::-webkit-calendar-picker-indicator": {
            filter: "invert(1)",
            cursor: "pointer",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
        containedPrimary: {
          color: "#fff",
        },
        outlinedPrimary: {
          color: "#fff",
        },
        textPrimary: {
          color: "#fff",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
  },
});
