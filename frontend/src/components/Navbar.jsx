import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <AppBar position="static" style={{ backgroundColor: '#2E3B55' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                        StudyFlow
                    </Link>
                </Typography>

                <Button color="inherit" component={Link} to="/">Ana Sayfa</Button>

                {/* EĞER KULLANICI ADMİNSE YÖNETİM BUTONUNU GÖSTER */}
                {user?.role === 'ADMIN' && (
                    <Button color="inherit" component={Link} to="/admin">Yönetim Paneli</Button>
                )}

                {/* EĞER KULLANICI VARSA (GİRİŞ YAPMIŞSA) */}
                {user ? (
                    <>
                        {/* YENİ EKLENEN BUTON: Sadece öğrenciler görsün istersek role check yapabiliriz */}
                        {user.role === 'STUDENT' && (
                            <Button color="inherit" component={Link} to="/my-reservations">
                                Rezervasyonlarım
                            </Button>
                        )}
                        {/* TIKLANABİLİR KULLANICI İSMİ */}
                        <Button
                            color="inherit"
                            component={Link}
                            to="/profile"
                            startIcon={<AccountCircleIcon />}
                            sx={{ mx: 1, textTransform: 'none', fontStyle: 'italic' }}
                        >
                            {user.name}
                        </Button>
                        <Button color="inherit" onClick={handleLogout} variant="outlined" sx={{ ml: 1, borderColor: 'white' }}>
                            Çıkış
                        </Button>
                    </>
                ) : (
                    // EĞER KİMSE YOKSA
                    <Button color="inherit" component={Link} to="/login" variant="outlined" sx={{ ml: 2 }}>
                        Giriş Yap
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;