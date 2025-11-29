import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Alert
} from '@mui/material';

const ReservationModal = ({ open, handleClose, spot }) => {
    // Form verilerini tutacak State'ler
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState(null); // Hata mesajı için

    const handleSubmit = () => {
        // 1. Basit validasyon: Tarihler boş mu?
        if (!startTime || !endTime) {
            setError("Lütfen başlangıç ve bitiş saatlerini seçiniz.");
            return;
        }

        // 2. Simülasyon: Backend'e gönderilecek veri paketi
        const reservationData = {
            spotId: spot.id,
            userId: 101, // Mock User ID
            start: startTime,
            end: endTime
        };

        console.log("Backend'e giden veri:", reservationData);

        // Şimdilik backend olmadığı için başarılı sayıp kapatıyoruz
        alert(`Rezervasyon İsteği Gönderildi!\n\nMasa: ${spot.name}\nTarih: ${startTime}`);

        // Modalı temizle ve kapat
        setError(null);
        handleClose();
    };

    if (!spot) return null; // Eğer seçili masa yoksa hiçbir şey gösterme

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ backgroundColor: '#2E3B55', color: 'white' }}>
                Rezervasyon Yap: {spot.name}
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                    Lütfen kullanmak istediğiniz saat aralığını seçiniz.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TextField
                    label="Başlangıç Saati"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />

                <TextField
                    label="Bitiş Saati"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="error">İptal</Button>
                <Button onClick={handleSubmit} variant="contained" color="success">
                    Onayla ve Bitir
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReservationModal;