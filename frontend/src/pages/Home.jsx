import React, { useState } from 'react';
import { Container, Grid, Typography, Box, TextField, InputAdornment } from '@mui/material';
import { Search, FilterList, Close } from '@mui/icons-material'; // <--- DÜZELTİLDİ
import SpotCard from '../components/SpotCard';
import ReservationModal from '../components/ReservationModal';
import { mockStudySpots } from '../services/mockData';
import { Stack, Chip } from '@mui/material'
import { motion } from 'framer-motion';

// Sistemde var olan tüm özellikleri buraya tanımlayalım (Filtre seçenekleri)
const AVAILABLE_FEATURES = [
    "Priz Var",
    "Sessiz Alan",
    "Klima",
    "Projeksiyon",
    "Beyaz Tahta",
    "Wifi Zayıf",
    "Açık Hava"
];

const Home = () => {
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // Arama metni
    const [selectedFilters, setSelectedFilters] = useState([]); // Seçili filtreler

    const handleOpenModal = (spot) => {
        setSelectedSpot(spot);
    };

    const handleCloseModal = () => {
        setSelectedSpot(null);
    };

    // --- FİLTRELEME MANTIĞI (toggle) ---
    const handleFilterToggle = (feature) => {
        if (selectedFilters.includes(feature)) {
            // Zaten seçiliyse çıkar
            setSelectedFilters(selectedFilters.filter(f => f !== feature));
        } else {
            // Seçili değilse ekle
            setSelectedFilters([...selectedFilters, feature]);
        }
    };

    // --- LİSTEYİ SÜZME İŞLEMİ (HEM Arama HEM Filtre) ---
    const filteredSpots = mockStudySpots.filter((spot) => {
        // 1. İsim araması (Search Bar)
        const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            spot.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. Özellik Filtresi (Checkbox mantığı)
        // Seçilen TÜM filtreler bu mekanda var mı? (AND mantığı)
        const matchesFilters = selectedFilters.every(filter => spot.features.includes(filter));

        return matchesSearch && matchesFilters;
    });

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* --- HERO SECTION --- */}
            <Box
                sx={{
                    textAlign: 'center',
                    py: 8,
                    mb: 6,
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)', // Hafif mor gradient arka plan
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Arka plan süsleri (Blob effect) */}
                <Box sx={{
                    position: 'absolute', top: -50, left: -50, width: 200, height: 200,
                    bgcolor: 'rgba(99, 102, 241, 0.2)', borderRadius: '50%', filter: 'blur(40px)'
                }} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <Typography
                        variant="h2"
                        component="h1"
                        gutterBottom
                        fontWeight="900" // Ekstra kalın
                        sx={{
                            background: 'linear-gradient(45deg, #4f46e5 30%, #ec4899 90%)', // Yazı içi renk geçişi
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-1px'
                        }}
                    >
                        Çalışma Alanını Keşfet.
                    </Typography>
                </motion.div>

                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                    Kampüsün en sessiz köşeleri, en hızlı interneti ve en rahat koltukları seni bekliyor.
                    Verimliliğini arttırmak için hemen yerini ayırt.
                </Typography>
            </Box>

            {/* --- ARAMA VE FİLTRE ALANI --- */}
            <Box maxWidth="md" mx="auto" mb={4}>

                {/* 1. Arama Çubuğu */}
                <TextField
                    fullWidth
                    placeholder="Mekan ara..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />

                {/* 2. Filtre Butonları (Chips) */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <FilterList color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">Özelliklere Göre Filtrele:</Typography>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {AVAILABLE_FEATURES.map((feature) => {
                        const isSelected = selectedFilters.includes(feature);
                        return (
                            <Chip
                                key={feature}
                                label={feature}
                                onClick={() => handleFilterToggle(feature)}
                                // Seçiliyse dolu renk, değilse boş
                                color={isSelected ? "primary" : "default"}
                                variant={isSelected ? "filled" : "outlined"}
                                onDelete={isSelected ? () => handleFilterToggle(feature) : undefined}
                                deleteIcon={<Close />}
                                sx={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            />
                        );
                    })}

                    {/* Temizle Butonu (Sadece filtre seçiliyse görünür) */}
                    {selectedFilters.length > 0 && (
                        <Chip
                            label="Temizle"
                            color="error"
                            variant="outlined"
                            onClick={() => setSelectedFilters([])}
                            size="small"
                        />
                    )}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    *Bu arama veritabanı indexleri kullanılarak yapılmaktadır.
                </Typography>
            </Box>

            {/* --- LİSTELEME (Artık 'filteredSpots' kullanıyoruz) --- */}
            <Grid container spacing={4}>
                {filteredSpots.length > 0 ? (
                    filteredSpots.map((spot, index) => (
                        <Grid item key={spot.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <SpotCard spot={spot} index={index} onReserve={() => handleOpenModal(spot)} />
                        </Grid>
                    ))
                ) : (
                    // Hiç sonuç yoksa kullanıcıya bilgi verelim
                    <Grid item size={{ xs: 12 }}>
                        <Box textAlign="center" py={5}>
                            <Typography variant="h6" color="text.secondary">
                                Aradığınız kriterlere uygun mekan bulunamadı.
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                                Filtreleri temizleyip tekrar deneyin.
                            </Typography>
                        </Box>
                    </Grid>
                )}
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