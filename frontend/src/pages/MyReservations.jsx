import React, { useState } from 'react';
import {
    Container, Typography, Box, Paper, Button, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Rating, Avatar, Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// İkonlar
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarRateIcon from '@mui/icons-material/StarRate';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';

// Mock Veri
const initialReservations = [
    { id: 101, spotName: "Kütüphane - Masa 12", date: "2023-11-25", time: "14:00 - 16:00", status: "AKTİF", image: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=100&q=80" },
    { id: 102, spotName: "Çalışma Odası B", date: "2023-11-28", time: "09:00 - 12:00", status: "BEKLEMEDE", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=100&q=80" },
    { id: 103, spotName: "Bahçe Alanı", date: "2023-10-15", time: "10:00 - 11:00", status: "TAMAMLANDI", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=100&q=80" },
];

const MyReservations = () => {
    const [reservations, setReservations] = useState(initialReservations);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedResId, setSelectedResId] = useState(null);
    const [score, setScore] = useState(0);

    // --- İŞLEM FONKSİYONLARI ---
    const handleCancel = (id) => {
        if (window.confirm("Rezervasyonu iptal etmek istediğine emin misin?")) {
            setReservations(reservations.filter(r => r.id !== id));
        }
    };

    const handleRateClick = (id) => {
        setSelectedResId(id);
        setRatingModalOpen(true);
    };

    const submitRating = () => {
        alert(`Puanınız (${score} Yıldız) kaydedildi! (Trigger Tetiklendi)`);
        setRatingModalOpen(false);
        setScore(0);
    };

    // Renk ve İkon Belirleme
    const getStatusConfig = (status) => {
        switch (status) {
            case 'AKTİF': return { color: 'success', label: 'Aktif', bg: '#dcfce7', text: '#166534' };
            case 'BEKLEMEDE': return { color: 'warning', label: 'Beklemede', bg: '#fef3c7', text: '#92400e' };
            case 'TAMAMLANDI': return { color: 'default', label: 'Tamamlandı', bg: '#f1f5f9', text: '#475569' };
            default: return { color: 'default', label: status, bg: '#eee', text: '#333' };
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 5, mb: 10 }}>

            {/* BAŞLIK ALANI */}
            <Box mb={5} textAlign="center">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', mb: 1 }}>
                        Rezervasyonlarım
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gelecek planların ve geçmiş çalışma oturumların burada listelenir.
                    </Typography>
                </motion.div>
            </Box>

            {/* LİSTELEME ALANI */}
            <Box display="flex" flexDirection="column" gap={3}>
                <AnimatePresence>
                    {reservations.length > 0 ? (
                        reservations.map((res, index) => {
                            const config = getStatusConfig(res.status);
                            return (
                                <motion.div
                                    key={res.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 3,
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                                borderColor: 'primary.light'
                                            },
                                            flexWrap: 'wrap' // Mobilde alt alta geçsin
                                        }}
                                    >
                                        {/* 1. Kısım: Resim ve Tarih */}
                                        <Box display="flex" alignItems="center" gap={2} minWidth={200}>
                                            <Avatar
                                                src={res.image}
                                                variant="rounded"
                                                sx={{ width: 60, height: 60, borderRadius: 3 }}
                                            />
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold" color="text.primary">
                                                    {res.date}
                                                </Typography>
                                                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                                                    <AccessTimeIcon fontSize="small" />
                                                    <Typography variant="body2">{res.time}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* 2. Kısım: Mekan Bilgisi (Orta) */}
                                        <Box flexGrow={1}>
                                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                                <PlaceIcon color="action" fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight="600">
                                                    {res.spotName}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={config.label}
                                                size="small"
                                                sx={{
                                                    bgcolor: config.bg,
                                                    color: config.text,
                                                    fontWeight: 'bold',
                                                    borderRadius: 2
                                                }}
                                            />
                                        </Box>

                                        {/* 3. Kısım: Aksiyon Butonları (Sağ) */}
                                        <Box display="flex" gap={1}>
                                            {(res.status === 'AKTİF' || res.status === 'BEKLEMEDE') && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<DeleteOutlineIcon />}
                                                    onClick={() => handleCancel(res.id)}
                                                    sx={{ borderRadius: 3, textTransform: 'none' }}
                                                >
                                                    İptal
                                                </Button>
                                            )}

                                            {res.status === 'TAMAMLANDI' && (
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    startIcon={<StarRateIcon />}
                                                    onClick={() => handleRateClick(res.id)}
                                                    sx={{
                                                        borderRadius: 3,
                                                        textTransform: 'none',
                                                        background: 'linear-gradient(45deg, #f59e0b 30%, #d97706 90%)', // Altın Sarısı
                                                        boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                                                    }}
                                                >
                                                    Puanla
                                                </Button>
                                            )}
                                        </Box>
                                    </Paper>
                                </motion.div>
                            );
                        })
                    ) : (
                        // BOŞ DURUM (Empty State)
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Box textAlign="center" py={8} sx={{ opacity: 0.6 }}>
                                <BookmarkAddedIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6">Henüz bir rezervasyonun yok.</Typography>
                                <Typography variant="body2">Hemen bir çalışma alanı seç ve verimliliğe başla!</Typography>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            {/* PUANLAMA MODALI */}
            <Dialog
                open={ratingModalOpen}
                onClose={() => setRatingModalOpen(false)}
                PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                    Deneyiminizi Puanlayın
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2, minWidth: 300 }}>
                    <Rating
                        name="size-large"
                        value={score}
                        onChange={(event, newValue) => setScore(newValue)}
                        size="large"
                        sx={{ fontSize: '3rem', mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary" align="center">
                        Bu işlem veritabanında "Reviews" tablosuna kayıt atar ve <br /> <b>Trigger</b> çalıştırarak profil puanınızı günceller.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button onClick={submitRating} variant="contained" sx={{ borderRadius: 50, px: 4 }}>
                        Gönder
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default MyReservations;