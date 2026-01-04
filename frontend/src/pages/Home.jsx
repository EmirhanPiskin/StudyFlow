import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, TextField, InputAdornment, Stack, Chip } from '@mui/material';
import { Search, FilterList, Close, BookmarkAdded as BookmarkIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpotCard from '../components/SpotCard';
import ReservationModal from '../components/ReservationModal';
import { Service } from '../services/api';

// Filtre Seçenekleri
const AVAILABLE_FEATURES = [
    "Priz", "Sessiz", "Klima", "Projeksiyon", "Beyaz Tahta", "WiFi", "Açık Hava"
];

const Home = () => {
    const [spots, setSpots] = useState([]); // Ham veri
    const [loading, setLoading] = useState(true);
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilters, setSelectedFilters] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSpots();
    }, []);

    // 1. Veri Çekme
    const fetchSpots = async (query = "") => {
        setLoading(true);
        try {
            // Backend'den isme göre filtrelenmiş veya tüm veriyi çeker
            const data = await Service.getSpots(query);
            setSpots(data);
        } catch (error) {
            console.error("Veri çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Filtre Buton Mantığı
    const handleFilterToggle = (feature) => {
        if (selectedFilters.includes(feature)) {
            setSelectedFilters(selectedFilters.filter(f => f !== feature));
        } else {
            setSelectedFilters([...selectedFilters, feature]);
        }
    };

    // 3. Filtreleme Mantığı (Frontend Tarafında)
    const filteredSpots = spots.filter((spot) => {
        // Eğer hiç filtre seçili değilse hepsini göster
        if (selectedFilters.length === 0) return true;

        // Seçilen her filtre, mekanın özelliklerinde (features) var mı?
        // Backend'den "Priz" gelebilir, filtrede "Priz Var" yazabilir. Partial match yapıyoruz:
        return selectedFilters.every(filter =>
            spot.features.some(f =>
                // Örn: "Priz Var" kelimesi "Priz" içeriyor mu kontrolü veya tam tersi
                f.toLowerCase().includes(filter.toLowerCase()) ||
                filter.toLowerCase().includes(f.toLowerCase())
            )
        );
    });

    // 4. Modal Açma (Giriş Kontrolü ile)
    const handleCardClick = (spot) => {
        // Direkt detay sayfasına git
        navigate(`/spot/${spot.id}`);
    };

    const handleCloseModal = () => {
        setSelectedSpot(null);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* --- HERO SECTION --- */}
            <Box
                sx={{
                    textAlign: 'center',
                    py: 8,
                    mb: 6,
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
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
                        fontWeight="900"
                        sx={{
                            background: 'linear-gradient(45deg, #4f46e5 30%, #ec4899 90%)',
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
                </Typography>
            </Box>

            {/* --- ARAMA VE FİLTRE ALANI --- */}
            <Box maxWidth="md" mx="auto" mb={4}>
                {/* Arama Çubuğu - GÜNCELLENMİŞ VERSİYON */}
                <TextField
                    fullWidth
                    placeholder="Mekan ara ve Enter'a bas..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Sadece state'i güncelle, istek atma
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            fetchSpots(searchTerm); // İstek sadece Enter'a basınca gitsin
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />

                {/* Filtre Butonları */}
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
                                color={isSelected ? "primary" : "default"}
                                variant={isSelected ? "filled" : "outlined"}
                                onDelete={isSelected ? () => handleFilterToggle(feature) : undefined}
                                deleteIcon={<Close />}
                                sx={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            />
                        );
                    })}
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
                    *İsim araması veritabanı indexleri, özellikler ise JS filtresi kullanır.
                </Typography>
            </Box>

            {/* --- LİSTELEME --- */}
            <Grid container spacing={4}>
                {/* BURADAKİ MANTIK DÜZELTİLDİ: filteredSpots.length kontrol ediliyor */}
                {filteredSpots.length > 0 ? (
                    filteredSpots.map((spot, index) => (
                        <Grid item key={spot.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <SpotCard
                                spot={spot}
                                index={index}
                                onReserve={() => handleCardClick(spot)} // Artık sayfaya yönlendiriyor
                            />
                        </Grid>
                    ))
                ) : (
                    // Hiç sonuç yoksa (Filtre sonucu boşsa)
                    <Grid item size={{ xs: 12 }}>
                        <Box textAlign="center" py={5}>
                            <BookmarkIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
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

        </Container>
    );
};

export default Home;