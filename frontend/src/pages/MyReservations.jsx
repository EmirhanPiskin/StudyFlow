import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Paper, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Rating, TextField, Grid, Avatar
} from '@mui/material';
import { Service } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PlaceIcon from '@mui/icons-material/Place';

const MyReservations = () => {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);

    // Modal State'leri
    const [open, setOpen] = useState(false);
    const [selectedRes, setSelectedRes] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState(""); // <--- YENİ: Yorum State'i

    useEffect(() => {
        if (user) fetchReservations();
    }, [user]);

    const fetchReservations = async () => {
        try {
            const data = await Service.getHistory(user.id);
            setReservations(data);
        } catch (error) {
            console.error("Geçmiş çekilemedi", error);
        }
    };

    const handleOpenModal = (res) => {
        setSelectedRes(res);
        setRating(5);
        setComment(""); // Modal açıldığında yorumu sıfırla
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setSelectedRes(null);
    };

    const handleSubmitReview = async () => {
        if (!selectedRes) return;

        try {
            await Service.addReview({
                userId: user.id,
                spotId: selectedRes.spotId,
                reservationId: selectedRes.id,
                rating: rating,
                comment: comment // <--- Yorum Backend'e gidiyor
            });

            alert("Değerlendirmeniz alındı! Puanınız mekana yansıdı.");
            setOpen(false);
            fetchReservations(); // Listeyi yenile (Buton "Puanlandı" olsun diye)
        } catch (error) {
            alert(error.response?.data?.detail || "Hata oluştu");
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?")) {
            try {
                await Service.cancelReservation(id);
                alert("Rezervasyon iptal edildi.");
                fetchReservations(); // Listeyi yenile ki durumu 'İPTAL' olarak görelim
            } catch (error) {
                alert("İptal işlemi başarısız: " + error);
            }
        }
    };

    if (!user) return <Typography sx={{ mt: 5, textAlign: 'center' }}>Lütfen giriş yapın.</Typography>;

    return (
        <Container maxWidth="md" sx={{ mt: 5, mb: 10 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom mb={4}>
                Rezervasyon Geçmişim 📅
            </Typography>

            {reservations.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc' }}>
                    <Typography color="text.secondary">Henüz bir rezervasyonunuz yok.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {reservations.map((res) => (
                        <Grid item size={{ xs: 12 }} key={res.id}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: 2
                                }}
                            >
                                {/* SOL: RESİM VE BİLGİ */}
                                <Box display="flex" alignItems="center" gap={3}>
                                    <Avatar
                                        src={res.image}
                                        variant="rounded"
                                        sx={{ width: 80, height: 80, borderRadius: 3 }}
                                    />
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={0.5}>
                                            <PlaceIcon fontSize="small" color="primary" />
                                            {res.spotName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                            <EventNoteIcon fontSize="small" />
                                            {res.date} | {res.time}
                                        </Typography>
                                        <Chip
                                            label={res.status}
                                            size="small"
                                            color={res.status === 'TAMAMLANDI' ? 'success' : res.status === 'İPTAL' ? 'error' : 'warning'}
                                            sx={{ mt: 1, fontWeight: 'bold' }}
                                        />
                                    </Box>
                                </Box>

                                {/* SAĞ: AKSİYON BUTONU */}
                                <Box>
                                    {res.status === 'TAMAMLANDI' && !res.hasReviewed && (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleOpenModal(res)}
                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Puanla & Yorum Yap
                                        </Button>
                                    )}

                                    {res.status === 'TAMAMLANDI' && res.hasReviewed && (
                                        <Typography variant="caption" sx={{ color: 'green', fontWeight: 'bold', display: 'block', textAlign: 'center' }}>
                                            ✅ Değerlendirildi
                                        </Typography>
                                    )}

                                    {res.status === 'AKTİF' && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleCancel(res.id)} // <--- BU SATIRI EKLE
                                        >
                                            İptal Et
                                        </Button>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* --- DEĞERLENDİRME MODALI --- */}
            <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Deneyimini Paylaş ✨
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={3} py={2}>
                        <Typography>Bu çalışma ortamından ne kadar memnun kaldın?</Typography>

                        {/* Yıldızlar */}
                        <Rating
                            name="simple-controlled"
                            value={rating}
                            onChange={(event, newValue) => setRating(newValue)}
                            size="large"
                            sx={{ fontSize: '3rem' }}
                        />

                        {/* Yorum Alanı */}
                        <TextField
                            autoFocus
                            margin="dense"
                            id="comment"
                            label="Yorumunuz (İsteğe bağlı)"
                            type="text"
                            fullWidth
                            multiline
                            rows={3} // 3 satırlık alan
                            variant="outlined"
                            placeholder="Sessiz miydi? İnternet hızlı mıydı? Diğer öğrencilere ipucu ver..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button onClick={handleCloseModal} color="inherit">Vazgeç</Button>
                    <Button
                        onClick={handleSubmitReview}
                        variant="contained"
                        size="large"
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        Gönder
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyReservations;