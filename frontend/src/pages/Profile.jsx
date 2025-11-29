import React, { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Avatar, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateProfile } = useAuth();

    // Form State'leri
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null);

    // Sayfa açılınca mevcut kullanıcı ismini input'a doldur
    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const handleUpdate = (e) => {
        e.preventDefault();

        // UPDATE İŞLEMİ SİMÜLASYONU
        // Backend'e: UPDATE users SET name=?, password=? WHERE id=?

        updateProfile({
            name: name,
            // Gerçekte şifre de backend'e gider ama context'te tutmaya gerek yok
        });

        setMessage({ type: 'success', text: 'Profil bilgileriniz başarıyla güncellendi!' });
    };

    if (!user) return <Typography>Lütfen giriş yapınız.</Typography>;

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}>
                    <AccountCircleIcon sx={{ fontSize: 50 }} />
                </Avatar>

                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Profil Düzenle
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={3}>
                    {user.role === 'ADMIN' ? 'Yönetici Hesabı' : 'Öğrenci Hesabı'} - {user.email}
                </Typography>

                {message && <Alert severity={message.type} sx={{ width: '100%', mb: 2 }}>{message.text}</Alert>}

                <Box component="form" onSubmit={handleUpdate} sx={{ width: '100%' }}>
                    <TextField
                        label="Ad Soyad"
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <TextField
                        label="Yeni Şifre"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Değiştirmek istemiyorsanız boş bırakın"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<SaveIcon />}
                        sx={{ mt: 3 }}
                    >
                        Değişiklikleri Kaydet (Update)
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Profile;