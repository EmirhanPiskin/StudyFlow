import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#6366f1', // Modern Indigo (Discord mavisine yakın)
            light: '#818cf8',
            dark: '#4f46e5',
        },
        secondary: {
            main: '#14b8a6', // Teal (Turkuaz)
        },
        background: {
            default: '#f8fafc', // Dümdüz beyaz değil, çok açık gri (Göz yormaz)
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', // Varsa Inter fontu
        h4: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 }, // Buton yazıları büyük harf olmasın
    },
    shape: {
        borderRadius: 16, // Kartlar daha yuvarlak olsun
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: 'none', // Flat tasarım
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.4)', // Hover'da glow efekti
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Dark mode'da oluşan katmanı kaldır
                },
            },
        },
    },
});

export default theme;