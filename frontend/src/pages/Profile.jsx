import React, { useState } from 'react';
import {
    Container, Paper, Box, Avatar, Typography, Chip, Button,
    TextField, Tabs, Tab, Alert, Stack
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Service } from '../services/api';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Profile = () => {
    const { user, logout } = useAuth();
    const [tabIndex, setTabIndex] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        username: user?.name || '',
        email: user?.email || '',
        password: ''
    });
    const [message, setMessage] = useState(null);
    const [studyStats, setStudyStats] = useState({
        total_study_hours: 0,
        total_study_minutes: 0,
        message: ""
    });

    // SQL FONKSİYON 2: Çalışma saati hesapla
    React.useEffect(() => {
        const loadStudyHours = async () => {
            try {
                const stats = await Service.getStudyHours(user.id);
                setStudyStats(stats);
            } catch (error) {
                console.error("İstatistik yüklenemedi", error);
            }
        };
        if (user?.id) loadStudyHours();
    }, [user?.id]);

    if (!user) return <Typography sx={{ mt: 5, textAlign: 'center' }}>Giriş yapmalısınız.</Typography>;

    const handleUpdate = async () => {
        if (!formData.username) {
            setMessage({ type: 'error', text: 'Kullanıcı adı boş olamaz.' });
            return;
        }

        try {
            const updateData = {
                userId: user.id,
                username: formData.username,
                password: formData.password
            };

            const response = await Service.updateProfile(updateData);

            if (response.user) {
                localStorage.setItem("studyflow_user", JSON.stringify(response.user));
                window.location.reload();
            }

            setMessage({ type: 'success', text: 'Bilgileriniz başarıyla güncellendi!' });
            setFormData({ ...formData, password: '' }); // Şifre alanını temizle

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Güncelleme başarısız.' });
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5, mb: 10 }}>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    bgcolor: 'white'
                }}
            >
                {/* ÜST KISIM: PROFİL BAŞLIĞI */}
                <Box sx={{ bgcolor: '#f8fafc', p: 4, textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                    <Avatar
                        sx={{
                            width: 100, height: 100,
                            bgcolor: user.role === 'ADMIN' ? '#ef4444' : '#4f46e5',
                            fontSize: 40, mx: 'auto', mb: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold" color="#1e293b">{user.name}</Typography>

                    <Chip
                        icon={user.role === 'ADMIN' ? <AdminPanelSettingsIcon fontSize="small" /> : undefined}
                        label={user.role === 'ADMIN' ? 'Yönetici Hesabı' : 'Öğrenci Hesabı'}
                        size="small"
                        sx={{ mt: 1, fontWeight: 'bold', bgcolor: 'white', border: '1px solid #e2e8f0' }}
                    />
                </Box>

                {/* SEKMELER */}
                <Tabs
                    value={tabIndex}
                    onChange={(e, v) => setTabIndex(v)}
                    centered
                    sx={{ borderBottom: '1px solid #e2e8f0' }}
                >
                    <Tab icon={<PersonIcon />} label="Bilgiler" />
                    <Tab icon={<ManageAccountsIcon />} label="Ayarlar" />
                </Tabs>

                <Box p={4}>
                    {/* SEKME 1: SADE BİLGİLER */}
                    {tabIndex === 0 && (
                        <Stack spacing={3}>
                            {/* SQL FONKSİYON 2 SONUCU: Çalışma Saati */}
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={2}
                                p={2}
                                borderRadius={3}
                                bgcolor="#e0f2f1"
                            >
                                <Avatar sx={{ bgcolor: '#009688', width: 50, height: 50, color: 'white' }}>⏱️</Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Toplam Çalışma Süresi</Typography>
                                    <Typography variant="h5" fontWeight="bold">{studyStats.total_study_hours} Saat</Typography>
                                    <Typography variant="caption" color="text.secondary">{studyStats.message}</Typography>
                                </Box>
                            </Box>

                            <Box
                                display="flex"
                                alignItems="center"
                                gap={2}
                                p={2}
                                borderRadius={3}
                                bgcolor="#f1f5f9"
                            >
                                <Avatar sx={{ bgcolor: 'white', color: '#4f46e5' }}><EmailIcon /></Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Kayıtlı E-Posta</Typography>
                                    <Typography variant="body1" fontWeight="500">{user.email}</Typography>
                                </Box>
                            </Box>

                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<LogoutIcon />}
                                fullWidth
                                onClick={logout}
                                sx={{ borderRadius: 2, py: 1.5 }}
                            >
                                Oturumu Kapat
                            </Button>
                        </Stack>
                    )}

                    {/* SEKME 2: GÜNCELLEME FORMU */}
                    {tabIndex === 1 && (
                        <Stack spacing={3}>
                            {message && <Alert severity={message.type}>{message.text}</Alert>}

                            <TextField
                                label="Ad Soyad"
                                fullWidth
                                variant="outlined"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />

                            <TextField
                                label="Yeni Şifre"
                                type="password"
                                fullWidth
                                variant="outlined"
                                placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                helperText="Güvenliğiniz için en az 6 karakter önerilir."
                            />

                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleUpdate}
                                sx={{ borderRadius: 2, py: 1.5, bgcolor: '#0f172a' }}
                            >
                                Değişiklikleri Kaydet
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default Profile;