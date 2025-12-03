import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                color: '#333'
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>

                {/* LOGO ALANI */}
                <Box display="flex" alignItems="center" gap={1} component={Link} to="/" sx={{ textDecoration: 'none' }}>
                    <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <SchoolIcon fontSize="small" />
                        </Avatar>
                    </motion.div>

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            background: 'linear-gradient(45deg, #4f46e5 30%, #ec4899 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.5px'
                        }}
                    >
                        StudyFlow
                    </Typography>
                </Box>

                {/* MENÜ BUTONLARI */}
                <Box display="flex" alignItems="center" gap={1}>
                    <Button color="inherit" component={Link} to="/" sx={{ fontWeight: 600 }}>
                        Ana Sayfa
                    </Button>

                    {user?.role === 'ADMIN' && (
                        <Button color="inherit" component={Link} to="/admin" sx={{ fontWeight: 600 }}>
                            Yönetim
                        </Button>
                    )}

                    {user ? (
                        <>
                            {user.role === 'STUDENT' && (
                                <Button color="inherit" component={Link} to="/my-reservations" sx={{ fontWeight: 600 }}>
                                    Rezervasyonlarım
                                </Button>
                            )}

                            {/* --- DÜZELTİLEN KISIM BAŞLANGIÇ --- */}
                            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f1f5f9', p: 0.5, borderRadius: 50 }}>

                                {/* İsim ve Avatar artık bir BUTON ve /profile adresine gidiyor */}
                                <Button
                                    component={Link}
                                    to="/profile"
                                    sx={{
                                        borderRadius: 50,
                                        textTransform: 'none',
                                        color: 'text.primary',
                                        px: 1,
                                        minWidth: 'auto',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } // Üzerine gelince hafif kararsın
                                    }}
                                >
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: 14, mr: 1 }}>
                                        {user.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight="600">
                                        {user.name}
                                    </Typography>
                                </Button>

                                {/* Çıkış butonu ayrı duruyor */}
                                <IconButton size="small" onClick={handleLogout} color="error" sx={{ bgcolor: 'white', ml: 0.5 }}>
                                    <LogoutIcon fontSize="small" />
                                </IconButton>

                            </Box>
                            {/* --- DÜZELTİLEN KISIM BİTİŞ --- */}
                        </>
                    ) : (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                component={Link}
                                to="/login"
                                variant="contained"
                                sx={{
                                    borderRadius: 50,
                                    px: 3,
                                    background: 'linear-gradient(45deg, #4f46e5 30%, #6366f1 90%)',
                                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
                                }}
                            >
                                Giriş Yap
                            </Button>
                        </motion.div>
                    )}
                </Box>

            </Toolbar>
        </AppBar>
    );
};

export default Navbar;