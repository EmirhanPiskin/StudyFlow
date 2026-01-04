import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Alert, Box
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Service } from '../services/api';
import { useAuth } from '../context/AuthContext'; // <--- 1. AuthContext EKLENDİ

const ReservationModal = ({ open, handleClose, spot }) => {
    const { user } = useAuth(); // <--- 2. Kullanıcı bilgisi alındı
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleSubmit = async () => {
        // Basit validasyon
        if (!startTime || !endTime) {
            alert("Lütfen saatleri seçiniz.");
            return;
        }

        const reservationData = {
            userId: user ? user.id : 1, // <--- 3. ARTIK DİNAMİK! (Ahmet'se 2 gider)
            spotId: spot.id,
            start: startTime,
            end: endTime
        };

        try {
            await Service.createReservation(reservationData);
            alert(`✅ Rezervasyon Başarılı!\nMasa: ${spot.name}`);
            handleClose();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert(`❌ HATA: ${error.response.data.detail}`);
            } else {
                alert("Beklenmedik bir hata oluştu.");
                console.error(error);
            }
        }
    };

    if (!spot) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    padding: 1,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }
            }}
        >
            <Box sx={{ bgcolor: '#f1f5f9', p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 2, color: 'primary.main' }}>
                    <EventAvailableIcon />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Rezervasyon Oluştur</Typography>
                    <Typography variant="body2" color="text.secondary">{spot.name}</Typography>
                </Box>
            </Box>

            <DialogContent sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    Lütfen kullanmak istediğiniz saat aralığını seçiniz.
                </Alert>

                <TextField
                    label="Başlangıç Saati"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <TextField
                    label="Bitiş Saati"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 2 }}>İptal</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disableElevation
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Onayla ve Bitir
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReservationModal;