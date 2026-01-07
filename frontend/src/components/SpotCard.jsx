import React, { memo } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip, Button, Rating } from '@mui/material';
import { AccessTime, Group, Star, Build } from '@mui/icons-material'; // Build ikonu eklendi (Tamir)
import { motion } from 'framer-motion';

const SpotCard = ({ spot, index, onReserve }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
            layout
        >
            <Card
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    // Eğer bakımda ise opaklığı düşür
                    opacity: spot.isAvailable ? 1 : 0.8,
                    filter: spot.isAvailable ? 'none' : 'grayscale(100%)', // Bakımda ise siyah-beyaz yap
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: spot.isAvailable ? 'translateY(-4px)' : 'none',
                        boxShadow: spot.isAvailable ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
                    }
                }}
            >
                <Box position="relative">
                    <CardMedia
                        component="img"
                        height="200"
                        image={spot.image_url}
                        alt={spot.name}
                        loading="lazy"
                        decoding="async"
                        sx={{ objectFit: 'cover', bgcolor: '#f1f5f9' }}
                    />

                    {/* BAKIMDA ETİKETİ */}
                    {!spot.isAvailable && (
                        <Chip
                            icon={<Build fontSize="small" style={{ color: 'white' }} />}
                            label="BAKIMDA"
                            size="small"
                            sx={{
                                position: 'absolute', top: 10, right: 10,
                                fontWeight: 'bold',
                                bgcolor: 'rgba(0,0,0,0.8)', color: 'white',
                                backdropFilter: 'blur(4px)'
                            }}
                        />
                    )}

                    {/* Puan Göstergesi */}
                    <Box
                        sx={{
                            position: 'absolute', bottom: 10, left: 10,
                            bgcolor: 'rgba(0,0,0,0.7)', color: 'white',
                            borderRadius: 20, px: 1, py: 0.5,
                            display: 'flex', alignItems: 'center', gap: 0.5,
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <Star sx={{ fontSize: 16, color: '#facc15' }} />
                        <Typography variant="caption" fontWeight="bold">
                            {spot.average_rating > 0 ? spot.average_rating : "Yeni"}
                        </Typography>
                        {spot.total_reviews > 0 && (
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                ({spot.total_reviews})
                            </Typography>
                        )}
                    </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="h6" fontWeight="bold" noWrap>
                            {spot.name}
                        </Typography>
                    </Box>

                    {/* Özellikler */}
                    <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
                        {spot.features && spot.features.slice(0, 3).map((feature, i) => (
                            <Chip key={i} label={feature} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 24, bgcolor: '#f8fafc' }} />
                        ))}
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="space-between" mt="auto">
                        <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                            <Group fontSize="small" />
                            <Typography variant="body2">{spot.capacity} Kişilik</Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Rating value={spot.average_rating || 0} precision={0.5} size="small" readOnly />
                        </Box>
                    </Box>
                </CardContent>

                <Box p={2} pt={0}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={spot.isAvailable ? onReserve : undefined} // Bakımda ise tıklama çalışmaz
                        disabled={!spot.isAvailable} // Görsel olarak disable olur
                        disableElevation
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            background: '#1e293b',
                            '&:hover': { background: '#0f172a' },
                            // Disabled durumunda rengi ayarla
                            '&.Mui-disabled': {
                                background: '#e2e8f0',
                                color: '#94a3b8'
                            }
                        }}
                    >
                        {spot.isAvailable ? "Rezervasyon" : "Bu mekan şu an bakımda!"}
                    </Button>
                </Box>
            </Card>
        </motion.div>
    );
};

export default memo(SpotCard);