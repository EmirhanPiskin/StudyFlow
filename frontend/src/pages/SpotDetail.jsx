import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Grid, Typography, Box, Paper, Chip, Button,
    Avatar, Rating, Divider, List, ListItem, ListItemAvatar, ListItemText,
    TextField, FormControl, InputLabel, Select, MenuItem, Alert, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { Service } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Saat Listesi Oluşturucu (08:00 - 23:00 arası)
const generateHours = () => {
    const hours = [];
    for (let i = 8; i <= 23; i++) {
        const hourStr = i < 10 ? `0${i}:00` : `${i}:00`;
        hours.push(hourStr);
    }
    return hours;
};

const SpotDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [spot, setSpot] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);

    // --- YENİ ZAMAN SEÇİM STATE'LERİ ---
    const [selectedDate, setSelectedDate] = useState("");
    const [startHour, setStartHour] = useState("");
    const [endHour, setEndHour] = useState("");
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const availableHours = generateHours();
    const today = new Date().toISOString().split('T')[0]; // "2024-01-07" formatını verir
    useEffect(() => {
        const loadData = async () => {
            const allSpots = await Service.getSpots();
            const foundSpot = allSpots.find(s => s.id === parseInt(id));
            setSpot(foundSpot);

            const reviewData = await Service.getSpotReviews(id);
            setReviews(reviewData);
        };
        loadData();
    }, [id]);

    useEffect(() => {
        const checkAvailability = async () => {
            if (selectedDate && startHour && endHour) {
                try {
                    // startHour "14:00" gibi gelmeli. Eğer dropdown sadece "14" dönüyorsa formatla.
                    // Bizim kodda "14:00" formatında olduğu için direkt gönderiyoruz.
                    const occupied = await Service.getOccupiedSeats(id, selectedDate, startHour, endHour);
                    setOccupiedSeats(occupied);

                    // Eğer seçili koltuk artık doluysa, seçimi kaldır
                    if (selectedSeat && occupied.includes(selectedSeat)) {
                        setSelectedSeat(null);
                        alert("Seçtiğiniz saat aralığında bu koltuk maalesef dolu.");
                    }
                } catch (error) {
                    console.error("Dolu koltuklar çekilemedi", error);
                }
            }
        };
        checkAvailability();
    }, [selectedDate, startHour, endHour, id]);

    const handleReserve = async () => {
        if (!user) return alert("Lütfen giriş yapın.");
        if (!selectedSeat) return alert("Lütfen oturmak istediğiniz koltuğu seçin!");
        if (!selectedDate || !startHour || !endHour) return alert("Lütfen tarih ve saat aralığını seçiniz.");
        if (parseInt(startHour) >= parseInt(endHour)) return alert("Saat hatası.");

        try {
            const finalStart = `${selectedDate}T${startHour}:00`;
            const finalEnd = `${selectedDate}T${endHour}:00`;

            await Service.createReservation({
                userId: user.id,
                spotId: parseInt(id),
                start: finalStart,
                end: finalEnd,
                seatNumber: selectedSeat // <--- ARTIK KOLTUK NO GÖNDERİYORUZ
            });

            alert("Rezervasyon Başarılı!");
            navigate('/my-reservations');
        } catch (error) {
            alert("Hata: " + (error.response?.data?.detail || "İşlem başarısız"));
        }
    };

    const [spotHistory, setSpotHistory] = useState([]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                // SQL FONKSİYON 1 ÇAĞRISI: get_spot_history
                const history = await Service.getSpotHistory(spot.id);
                setSpotHistory(history);
            } catch (error) {
                console.error("Geçmiş yüklenemedi", error);
            }
        };
        if (spot?.id) loadHistory();
    }, [spot?.id]);

    if (!spot) return <Typography sx={{ mt: 10, textAlign: 'center' }}>Yükleniyor...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Geri Dön
            </Button>

            <Grid container spacing={4}>
                {/* SOL TARAF: MEKAN BİLGİSİ VE GÖRSEL */}
                <Grid item size={{ xs: 12, md: 5 }}>
                    <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                        <img
                            src={spot.image_url}
                            alt={spot.name}
                            style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                        />
                        <Box p={3}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>{spot.name}</Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Rating value={spot.average_rating || 0} readOnly precision={0.5} />
                                <Typography color="text.secondary">({reviews.length} Değerlendirme)</Typography>
                            </Box>

                            <Typography variant="subtitle1" fontWeight="bold" mt={2}>Özellikler:</Typography>
                            <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                                {spot.features.map((f, i) => (
                                    <Chip key={i} label={f} color="primary" variant="outlined" />
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* SAĞ TARAF: GÖRSEL MASA SEÇİMİ VE ZAMANLAMA */}
                <Grid item size={{ xs: 12, md: 7 }}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h5" fontWeight="bold" mb={3}>Rezervasyon Detayları 📅</Typography>

                        {/* --- MASA DÜZENİ SİMÜLASYONU --- */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 250,
                                bgcolor: '#f8fafc',
                                borderRadius: 8,
                                position: 'relative',
                                border: '2px dashed #cbd5e1',
                                mb: 4
                            }}
                        >
                            {/* ORTA MASA */}
                            <Box
                                sx={{
                                    width: 120, height: 120,
                                    bgcolor: '#475569',
                                    borderRadius: 4,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                                }}
                            >
                                MASA
                            </Box>

                            {/* SANDALYELER */}
                            {Array.from({ length: spot.capacity }).map((_, index) => {
                                const seatNum = index + 1;
                                const isOccupied = occupiedSeats.includes(seatNum); // Dolu mu?
                                const isSelected = selectedSeat === seatNum;

                                // SQL FONKSİYON 3: Koltuk müsaitlik kontrolü
                                const handleSeatClick = async () => {
                                    if (isOccupied) return; // Doluysa tıklanmasın

                                    if (!selectedDate || !startHour || !endHour) {
                                        alert("Lütfen tarih ve saat aralığını seçiniz.");
                                        return;
                                    }

                                    try {
                                        const result = await Service.checkAvailability(
                                            spot.id,
                                            `${selectedDate}T${startHour}:00`,
                                            `${selectedDate}T${endHour}:00`,
                                            seatNum
                                        );

                                        if (result.is_available) {
                                            setSelectedSeat(seatNum);
                                            alert(`✅ ${result.message}`);
                                        } else {
                                            alert(`❌ ${result.message}`);
                                        }
                                    } catch (error) {
                                        console.error("Müsaitlik kontrolü başarısız", error);
                                    }
                                };

                                // Koordinat hesapları aynı...
                                const angle = (index / spot.capacity) * 2 * Math.PI;
                                const radius = 90;
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;

                                return (
                                    <Box
                                        key={index}
                                        onClick={handleSeatClick}
                                        sx={{
                                            position: 'absolute',
                                            transform: `translate(${x}px, ${y}px)`,
                                            cursor: isOccupied ? 'not-allowed' : 'pointer', // İmleç değişsin
                                            textAlign: 'center',
                                            opacity: isOccupied ? 0.5 : 1 // Doluysa biraz silik dursun
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                // Doluysa KIRMIZI, Seçiliyse YEŞİL, Boşsa BEYAZ
                                                bgcolor: isOccupied ? '#ef4444' : (isSelected ? '#16a34a' : '#fff'),
                                                color: isOccupied ? '#fff' : (isSelected ? '#fff' : '#64748b'),
                                                border: isSelected ? 'none' : '2px solid #64748b',
                                                width: 40, height: 40, transition: 'all 0.3s'
                                            }}
                                        >
                                            <EventSeatIcon fontSize="small" />
                                        </Avatar>
                                        <Typography variant="caption" fontWeight="bold" sx={{ display: 'block' }}>
                                            {index + 1}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">Tarih ve Saat Seçimi:</Typography>
                        <Grid container spacing={2}>
                            {/* 1. TARİH SEÇİMİ */}
                            <Grid item size={{ xs: 12 }}>
                                <TextField
                                    type="date"
                                    fullWidth
                                    label="Tarih"
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: today }} // <--- İŞTE SİHİRLİ KOD BU!
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </Grid>

                            {/* 2. BAŞLANGIÇ SAATİ (Dropdown) */}
                            <Grid item size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Başlangıç</InputLabel>
                                    <Select
                                        value={startHour}
                                        label="Başlangıç"
                                        onChange={(e) => setStartHour(e.target.value)}
                                    >
                                        {availableHours.map((h) => (
                                            <MenuItem key={h} value={h}>{h}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* 3. BİTİŞ SAATİ (Dropdown) */}
                            <Grid item size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Bitiş</InputLabel>
                                    <Select
                                        value={endHour}
                                        label="Bitiş"
                                        onChange={(e) => setEndHour(e.target.value)}
                                    >
                                        {availableHours.map((h) => (
                                            <MenuItem key={h} value={h}>{h}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {spot.isAvailable ? (
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{ mt: 3, borderRadius: 3, py: 1.5, bgcolor: '#1e293b' }}
                                onClick={handleReserve}
                                disabled={!selectedSeat}
                            >
                                {selectedSeat ? `${selectedSeat} Numaralı Koltuğu Ayırt` : "Lütfen Koltuk Seçin"}
                            </Button>
                        ) : (
                            <Alert severity="warning" sx={{ mt: 3, borderRadius: 3 }}>
                                <Typography fontWeight="bold">Bu mekan şu anda hizmet dışıdır.</Typography>
                                Tadilat veya bakım çalışmaları nedeniyle rezervasyon yapılamamaktadır.
                            </Alert>
                        )}
                    </Paper>

                </Grid>

                {/* ALT KISIM: YORUMLAR */}
                <Grid item size={{ xs: 12 }}>
                    <Box mt={4}>
                        <Typography variant="h5" fontWeight="bold" mb={2}>Kullanıcı Yorumları</Typography>
                        <Divider sx={{ mb: 2 }} />

                        {reviews.length > 0 ? (
                            <List>
                                {reviews.map((review, index) => (
                                    <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f1f5f9', borderRadius: 3 }}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                    {review.username.charAt(0).toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography fontWeight="bold">{review.username}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{review.date}</Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box mt={1}>
                                                        <Rating value={review.rating} size="small" readOnly />
                                                        <Typography variant="body2" color="text.primary" mt={0.5}>
                                                            {review.comment}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </Paper>
                                ))}
                            </List>
                        ) : (
                            <Alert severity="info" sx={{ bgcolor: '#e0f2fe' }}>Henüz yorum yapılmamış. İlk yorumu sen yap!</Alert>
                        )}
                    </Box>
                </Grid>

                {/* MEKAN RESERVASİYON GEÇMİŞİ */}
                <Grid item size={{ xs: 12 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', mt: 4 }}>
                        <Typography variant="h5" fontWeight="bold" mb={3}>📋 Mekan Rezervasyon Geçmişi</Typography>

                        {spotHistory && spotHistory.length > 0 ? (
                            <Table>
                                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Kullanıcı</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tarih & Saat</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {spotHistory.map((res, idx) => (
                                        <TableRow key={idx} sx={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{res.username}</TableCell>
                                            <TableCell>{res.start_time}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={res.status}
                                                    color={res.status === 'AKTİF' ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                Henüz rezervasyon yok.
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default SpotDetail;