import React, { useState } from 'react';
import {
    Container, Typography, Box, Tabs, Tab, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Chip, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import AddSpotModal from '../components/AddSpotModal';

// Mock veriyi çekiyoruz (Başlangıç durumu için)
import { mockStudySpots } from '../services/mockData';

const AdminPanel = () => {
    const [tabIndex, setTabIndex] = useState(0);
    // Silme işlemini simüle etmek için veriyi state'e alıyoruz
    const [spots, setSpots] = useState(mockStudySpots);

    // Sekme değiştirme fonksiyonu
    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    // Ekleme modalını açıp kapatmak için
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // SİLME İŞLEMİ (DELETE Kısıtı Simülasyonu)
    const handleDelete = (id) => {
        if (window.confirm("Bu çalışma alanını silmek istediğinize emin misiniz? (Veritabanı ilişkili kayıtları kontrol edecek)")) {
            // Gerçekte burada API'ye istek atacağız: deleteSpot(id)
            const newSpots = spots.filter(s => s.id !== id);
            setSpots(newSpots);
            alert("Kayıt başarıyla silindi!");
        }
    };

    // YENİ FONKSİYON: INSERT İŞLEMİ (Sequence Simülasyonu)
    const handleAddSpot = (newSpotData) => {
        // Veritabanındaki SEQUENCE mantığı: Son ID'yi bul + 1 ekle
        const newId = spots.length > 0 ? Math.max(...spots.map(s => s.id)) + 1 : 1;

        const spotWithId = { ...newSpotData, id: newId };

        // State'i güncelle (Listeye ekle)
        setSpots([...spots, spotWithId]);

        alert(`Başarılı! Yeni alan eklendi. (ID: ${newId})`);
    };

    // İSTATİSTİK KARTLARI (Aggregate Fonksiyon Simülasyonu)
    const StatCard = ({ title, value, desc, color }) => (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center', bgcolor: color, color: 'white' }}>
            <Typography variant="h3" fontWeight="bold">{value}</Typography>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>{desc}</Typography>
        </Paper>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
                Yönetim Paneli
            </Typography>

            {/* Sekmeler */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabIndex} onChange={handleTabChange} centered>
                    <Tab icon={<AssessmentIcon />} label="Genel Durum & Raporlar" />
                    <Tab icon={<TableRestaurantIcon />} label="Çalışma Alanı Yönetimi" />
                </Tabs>
            </Box>

            {/* --- SEKME 1: RAPORLAR (Dashboard) --- */}
            {tabIndex === 0 && (
                <Grid container spacing={3}>
                    <Grid item size={{ xs: 12, md: 4 }}>
                        {/* SELECT COUNT(*) FROM reservations */}
                        <StatCard
                            title="Aktif Rezervasyon"
                            value="12"
                            desc="Şu an sistemdeki toplam doluluk"
                            color="#2E3B55"
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, md: 4 }}>
                        {/* SELECT AVG(rating) FROM reviews */}
                        <StatCard
                            title="Ortalama Memnuniyet"
                            value="4.8/5.0"
                            desc="Son 30 günlük verimlilik puanları"
                            color="#2E7D32"
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, md: 4 }}>
                        {/* SELECT COUNT(*) FROM users WHERE role='STUDENT' */}
                        <StatCard
                            title="Kayıtlı Öğrenci"
                            value="345"
                            desc="Sistemi kullanan toplam öğrenci"
                            color="#ed6c02"
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, md: 12 }} sx={{ mt: 2 }}>
                        <Paper sx={{ p: 2, border: '1px dashed #1976d2' }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Özel Kitle Analizi
                            </Typography>
                            <Box display="flex" gap={2}>
                                <Button variant="outlined" size="small" onClick={() => alert("Sorgu: UNION ALL çalıştı.\nHem A hem B binasını kullananlar listelendi.")}>
                                    Tüm Salonları Kullananlar (UNION)
                                </Button>
                                <Button variant="outlined" size="small" onClick={() => alert("Sorgu: INTERSECT çalıştı.\nHem geçen ay hem bu ay rezervasyon yapan sadık öğrenciler.")}>
                                    Sadık Öğrenciler (INTERSECT)
                                </Button>
                                <Button variant="outlined" size="small" color="error" onClick={() => alert("Sorgu: EXCEPT çalıştı.\nKayıtlı olup hiç rezervasyon yapmayanlar.")}>
                                    Pasif Kullanıcılar (EXCEPT)
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                ℹ️ <strong>Sistem Notu:</strong> Yukarıdaki veriler <code>view_daily_stats</code> isimli veritabanı View'inden çekilmektedir.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* --- SEKME 2: YÖNETİM (CRUD Tablosu) --- */}
            {tabIndex === 1 && (
                <Box>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button variant="contained" startIcon={<AddCircleIcon />} color="primary" onClick={() => setIsAddModalOpen(true)}>
                            Yeni Alan Ekle
                        </Button>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                                <TableRow>
                                    <TableCell><strong>ID</strong></TableCell>
                                    <TableCell><strong>Alan Adı</strong></TableCell>
                                    <TableCell><strong>Kapasite</strong></TableCell>
                                    <TableCell><strong>Özellikler</strong></TableCell>
                                    <TableCell><strong>Durum</strong></TableCell>
                                    <TableCell align="right"><strong>İşlemler</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {spots.map((spot) => (
                                    <TableRow key={spot.id}>
                                        <TableCell>{spot.id}</TableCell>
                                        <TableCell>{spot.name}</TableCell>
                                        <TableCell>{spot.capacity} Kişi</TableCell>
                                        <TableCell>
                                            {spot.features.map((f, i) => (
                                                <span key={i} style={{ fontSize: '12px', marginRight: '4px' }}>• {f}</span>
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={spot.isAvailable ? "Aktif" : "Bakımda/Dolu"}
                                                color={spot.isAvailable ? "success" : "warning"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton color="error" onClick={() => handleDelete(spot.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <AddSpotModal
                        open={isAddModalOpen}
                        handleClose={() => setIsAddModalOpen(false)}
                        onAdd={handleAddSpot}
                    />
                </Box>
            )}
        </Container>
    );
};

export default AdminPanel;