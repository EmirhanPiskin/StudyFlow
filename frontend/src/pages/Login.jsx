import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const success = login(email, password);
        if (success) {
            if (email.includes("admin")) navigate('/admin');
            else navigate('/');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '80vh', // Ekranı kaplasın
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 50% 50%, #e0e7ff 0%, #f8fafc 100%)' // Hafif glow efekti
            }}
        >
            <Container maxWidth="xs">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Paper
                        elevation={0} // Gölgeyi biz CSS ile vereceğiz
                        sx={{
                            padding: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: 4,
                            border: '1px solid rgba(255,255,255,0.8)',
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' // Soft gölge
                        }}
                    >

                        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>
                            <LockOutlinedIcon fontSize="large" />
                        </Avatar>

                        <Typography component="h1" variant="h5" fontWeight="bold" color="text.primary">
                            Tekrar Hoşgeldin!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            StudyFlow hesabına giriş yap
                        </Typography>

                        <Alert severity="info" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                            Admin: <b>admin@uni.edu</b> <br /> Öğrenci: Rastgele bir mail
                        </Alert>

                        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="E-Posta Adresi"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 } // İnputlar yuvarlak
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Şifre"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{
                                    mt: 3, mb: 2, py: 1.5, fontSize: '1rem',
                                    background: 'linear-gradient(45deg, #4f46e5 30%, #6366f1 90%)',
                                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
                                }}
                            >
                                Giriş Yap
                            </Button>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default Login;