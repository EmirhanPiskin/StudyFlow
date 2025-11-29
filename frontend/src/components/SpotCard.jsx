import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Chip, Stack, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Bu bileşen "spot" adında bir veri (prop) alır ve onu ekrana çizer
const SpotCard = ({ spot, onReserve }) => {

    return (
        <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Resim Alanı */}
            <CardMedia
                component="img"
                height="140"
                image={spot.image}
                alt={spot.name}
            />

            <CardContent sx={{ flexGrow: 1 }}>
                {/* Başlık ve Kapasite */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {spot.name}
                    </Typography>
                    <Chip
                        icon={<PersonIcon />}
                        label={`${spot.capacity} Kişilik`}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                {/* Özellikler (Priz var, Klima var vs.) */}
                <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                    {spot.features.map((feature, index) => (
                        <Chip key={index} label={feature} size="small" color="primary" sx={{ opacity: 0.8 }} />
                    ))}
                </Stack>

                {/* Müsaitlik Durumu */}
                <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                    Durum:
                    {spot.isAvailable ? (
                        <span style={{ color: 'green', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon fontSize="small" /> Müsait
                        </span>
                    ) : (
                        <span style={{ color: 'red', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <CancelIcon fontSize="small" /> Dolu
                        </span>
                    )}
                </Typography>
            </CardContent>

            {/* Buton Alanı */}
            <Box p={2} pt={0}>
                <Button
                    variant="contained"
                    fullWidth
                    color={spot.isAvailable ? "success" : "error"}
                    disabled={!spot.isAvailable} // Doluysa tıklanamasın
                    onClick={onReserve}
                >
                    {spot.isAvailable ? "Rezerve Et" : "Şu An Dolu"}
                </Button>
            </Box>
        </Card>
    );
};

export default SpotCard;