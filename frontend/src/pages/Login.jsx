import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Context'i çek
import { useNavigate } from 'react-router-dom'; // Sayfa değiştirmek için

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { login } = useAuth(); // Context'ten login fonksiyonunu al
    const navigate = useNavigate(); // Yönlendirme aracı

    const handleLogin = (e) => {
        e.preventDefault();

        // Login fonksiyonunu çalıştır
        const success = login(email, password);

        if (success) {
            // Eğer e-posta içinde "admin" geçiyorsa Admin paneline, yoksa Ana sayfaya at
            if (email.includes("admin")) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ padding: 4, width: '100%', textAlign: 'center' }}>

                    <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                        StudyFlow Giriş
                    </Typography>

                    {/* Bilgilendirme Notu */}
                    <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem', textAlign: 'left' }}>
                        <strong>İpucu:</strong> Admin olmak için e-posta kısmına "admin" yazın (örn: admin@uni.edu). Öğrenci için rastgele bir şey yazın.
                    </Alert>

                    <form onSubmit={handleLogin}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="E-Posta Adresi"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Şifre"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                        >
                            Giriş Yap
                        </Button>
                    </form>

                </Paper>
            </Box>
        </Container>
    );
};

export default Login;