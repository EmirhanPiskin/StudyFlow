import React, { useState } from 'react';
import { Container, Grid, Typography, Box, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material'; // <--- DÜZELTİLDİ
import SpotCard from '../components/SpotCard';
import ReservationModal from '../components/ReservationModal';
import { mockStudySpots } from '../services/mockData';

const Home = () => {
    const [selectedSpot, setSelectedSpot] = useState(null);

    const handleOpenModal = (spot) => {
        setSelectedSpot(spot);
    };

    const handleCloseModal = () => {
        setSelectedSpot(null);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4} textAlign="center">
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    Çalışma Alanları
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Kampüsün en verimli köşelerini keşfet ve hemen yerini ayırt.
                </Typography>
            </Box>

            {/* ARAMA ÇUBUĞU */}
            <Box maxWidth="md" mx="auto" mb={4}>
                <TextField
                    fullWidth
                    placeholder="Mekan ara (Örn: Sessiz, Kütüphane, Projeksiyon)..."
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                {/* DÜZELTİLDİ: SearchIcon yerine Search */}
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                    onChange={(e) => console.log("Index araması yapılıyor:", e.target.value)}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    *Bu arama veritabanı indexleri kullanılarak yapılmaktadır.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {mockStudySpots.map((spot) => (
                    <Grid item key={spot.id} xs={12} sm={6} md={4}>
                        <SpotCard spot={spot} onReserve={() => handleOpenModal(spot)} />
                    </Grid>
                ))}
            </Grid>

            <ReservationModal
                open={!!selectedSpot}
                handleClose={handleCloseModal}
                spot={selectedSpot}
            />
        </Container>
    );
};

export default Home;