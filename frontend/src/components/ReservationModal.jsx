import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Alert, Box
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const ReservationModal = ({ open, handleClose, spot }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleSubmit = () => {
        // ... eski mantık aynı ...
        alert(`Rezervasyon İsteği Gönderildi!\n\nMasa: ${spot.name}`);
        handleClose();
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
                    borderRadius: 4, // Köşeleri iyice yuvarla
                    padding: 1,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }
            }}
        >
            {/* Özel Başlık Alanı */}
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