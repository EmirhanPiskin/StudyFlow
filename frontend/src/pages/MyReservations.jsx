import React, { useState } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, Alert, Rating, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Mock veriyi burada simüle ediyoruz (Normalde veritabanından 'SELECT * FROM reservations WHERE user_id=1' ile gelir)
const initialReservations = [
    { id: 101, spotName: "Kütüphane - Masa 12", date: "2023-11-25", time: "14:00 - 16:00", status: "AKTİF" },
    { id: 102, spotName: "Çalışma Odası B", date: "2023-11-28", time: "09:00 - 12:00", status: "BEKLEMEDE" },
    { id: 103, spotName: "Bahçe Alanı", date: "2023-10-15", time: "10:00 - 11:00", status: "TAMAMLANDI" },
];

const MyReservations = () => {
    const [reservations, setReservations] = useState(initialReservations);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedResId, setSelectedResId] = useState(null);
    const [score, setScore] = useState(0);
    // Puanlama Fonksiyonu
    const handleRateClick = (id) => {
        setSelectedResId(id);
        setRatingModalOpen(true);
    };

    const submitRating = () => {
        // Backend'e INSERT INTO reviews ... isteği gider
        // Backend'de TRIGGER çalışır ve User tablosunu günceller.
        alert(`Puanınız (${score} Yıldız) kaydedildi! (Trigger Tetiklendi: Kullanıcı puanı güncellendi)`);
        setRatingModalOpen(false);
    };
    // DELETE İŞLEMİ SİMÜLASYONU
    const handleCancel = (id) => {
        if (window.confirm("Rezervasyonunuzu iptal etmek istediğinize emin misiniz?")) {
            // Backend'e istek: DELETE FROM reservations WHERE id = ...
            const updatedList = reservations.filter(res => res.id !== id);
            setReservations(updatedList);
        }
    };

    // Duruma göre renk veren fonksiyon
    const getStatusColor = (status) => {
        switch (status) {
            case 'AKTİF': return 'success';
            case 'BEKLEMEDE': return 'warning';
            case 'TAMAMLANDI': return 'default';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <CalendarMonthIcon fontSize="large" color="primary" /> Rezervasyonlarım
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                Aşağıdaki listede geçmiş ve gelecek tüm rezervasyonlarınızı görüntüleyebilirsiniz.
            </Alert>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Mekan Adı</strong></TableCell>
                            <TableCell><strong>Tarih</strong></TableCell>
                            <TableCell><strong>Saat Aralığı</strong></TableCell>
                            <TableCell><strong>Durum</strong></TableCell>
                            <TableCell align="right"><strong>İşlem</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reservations.length > 0 ? (
                            reservations.map((res) => (
                                <TableRow key={res.id}>
                                    <TableCell>{res.spotName}</TableCell>
                                    <TableCell>{res.date}</TableCell>
                                    <TableCell>{res.time}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={res.status}
                                            color={getStatusColor(res.status)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {res.status === 'TAMAMLANDI' && (
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                size="small"
                                                onClick={() => handleRateClick(res.id)}
                                            >
                                                Puan Ver
                                            </Button>
                                        )}
                                        {(res.status === 'AKTİF' || res.status === 'BEKLEMEDE') && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleCancel(res.id)}
                                            >
                                                İptal Et
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Henüz bir rezervasyonunuz bulunmamaktadır.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={ratingModalOpen} onClose={() => setRatingModalOpen(false)}>
                <DialogTitle>Deneyiminizi Puanlayın</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2 }}>
                    <Rating
                        name="simple-controlled"
                        value={score}
                        onChange={(event, newValue) => setScore(newValue)}
                        size="large"
                    />
                    <Typography variant="caption" sx={{ mt: 2 }}>
                        Bu işlem "reviews" tablosuna kayıt atar ve Trigger çalıştırır.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRatingModalOpen(false)}>Vazgeç</Button>
                    <Button onClick={submitRating} variant="contained">Gönder</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyReservations;