import { createTheme } from "@mui/material";

// Colores inspirados en Microsoft Office
// Word: #2B579A (azul)
// Excel: #217346 (verde)
// PowerPoint: #D24726 (naranja)
// SharePoint: #0078D4 (azul claro)

export const theme = createTheme({
  palette: {
    primary: {
      main: "#2B579A", // Azul Word
    },
    secondary: {
      main: "#217346", // Verde Excel
    },
    info: {
      main: "#0078D4", // Azul SharePoint
    },
    background: {
      default: "#F3F2F1", // Gris claro Microsoft
      paper: "#FFFFFF",
    },
    text: {
      primary: "#323130",
      secondary: "#605E5C",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#2B579A", // Azul Word para navbar
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-input": {
            color: "#323130",
          },
          "& .MuiOutlinedInput-input::placeholder": {
            color: "#605E5C",
            opacity: 1,
          },
          "& input[type='date']": {
            color: "#323130",
            colorScheme: "light",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: "#2B579A",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#1f4178",
          },
        },
        containedSecondary: {
          backgroundColor: "#217346",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#185c37",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#323130",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#323130",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: "#323130",
          "&.Mui-selected": {
            backgroundColor: "#E1DFDD",
          },
          "&:hover": {
            backgroundColor: "#F3F2F1",
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "#323130",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "#323130",
        },
        head: {
          backgroundColor: "#F3F2F1",
          fontWeight: 600,
          color: "#323130",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 1.6px 3.6px 0 rgba(0,0,0,.132), 0 0.3px 0.9px 0 rgba(0,0,0,.108)",
        },
      },
    },
  },
});
