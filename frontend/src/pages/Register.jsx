// src/pages/Register.jsx
import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Service } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleRegister = async () => {
        try {
            await Service.register(formData);
            alert("Kayıt Başarılı! Giriş ekranına yönlendiriliyorsunuz.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || "Kayıt sırasında hata oluştu.");
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 10 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                    Aramıza Katıl 🚀
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <TextField
                        label="Ad Soyad"
                        fullWidth
                        variant="outlined"
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <TextField
                        label="E-Posta"
                        fullWidth
                        variant="outlined"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <TextField
                        label="Şifre"
                        type="password"
                        fullWidth
                        variant="outlined"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleRegister}
                        sx={{ mt: 1, borderRadius: 2 }}
                    >
                        Kayıt Ol
                    </Button>
                    <Button
                        color="secondary"
                        onClick={() => navigate('/login')}
                        sx={{ textTransform: 'none' }}
                    >
                        Zaten hesabın var mı? Giriş Yap
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;