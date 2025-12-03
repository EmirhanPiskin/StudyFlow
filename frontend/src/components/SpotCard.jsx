import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Chip, Stack, Box } from '@mui/material';
import { motion } from 'framer-motion'; // <--- SİHİR BURADA
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Kartın kendisini Motion bileşenine çeviriyoruz
const MotionCard = motion(Card);

const SpotCard = ({ spot, onReserve, index }) => {
    return (
        <MotionCard
            // 1. Ekrana Giriş Animasyonu (Fade In + Yukarı Çıkma)
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }} // Sırayla gelsinler diye delay

            // 2. Hover (Üzerine Gelme) Efekti
            whileHover={{
                y: -10, // Yukarı kalksın
                boxShadow: "0px 15px 30px rgba(0,0,0,0.15)" // Gölge büyüsün
            }}

            sx={{
                maxWidth: 345,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible' // Hover efekti kesilmesin diye
            }}
        >
            {/* Resim Alanı - Kenarları hafif yuvarlak */}
            <Box sx={{ p: 1.5, pb: 0 }}>
                <CardMedia
                    component="img"
                    height="160"
                    image={spot.image}
                    alt={spot.name}
                    sx={{ borderRadius: '12px' }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Başlık ve Kapasite */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        {spot.name}
                    </Typography>
                    <Chip
                        icon={<PersonIcon style={{ fontSize: 16 }} />}
                        label={spot.capacity}
                        size="small"
                        sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main', fontWeight: 'bold' }}
                    />
                </Box>

                {/* Özellikler - Renkli Gradient Taglar */}
                <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                    {spot.features.map((feature, i) => (
                        <Chip
                            key={i}
                            label={feature}
                            size="small"
                            sx={{
                                fontSize: '0.7rem',
                                height: 24,
                                bgcolor: '#f1f5f9',
                                border: '1px solid #e2e8f0'
                            }}
                        />
                    ))}
                </Stack>
            </CardContent>

            {/* Alt Bar: Durum ve Buton */}
            <Box p={2} pt={0} display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                    {spot.isAvailable ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                        <CancelIcon color="error" fontSize="small" />
                    )}
                    <Typography variant="caption" fontWeight="bold" color={spot.isAvailable ? "success.main" : "error.main"}>
                        {spot.isAvailable ? "Müsait" : "Dolu"}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    disableElevation // Gölgeyi kaldır, biz hover ile vereceğiz
                    color={spot.isAvailable ? "primary" : "inherit"}
                    disabled={!spot.isAvailable}
                    onClick={onReserve}
                    sx={{
                        px: 3,
                        opacity: spot.isAvailable ? 1 : 0.5
                    }}
                >
                    {spot.isAvailable ? "Seç" : "Dolu"}
                </Button>
            </Box>
        </MotionCard>
    );
};

export default SpotCard;