import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Tabs, Tab, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Chip, Grid, Avatar, Rating,
    Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemAvatar, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// İkonlar
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddCircleIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PeopleIcon from '@mui/icons-material/People';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScienceIcon from '@mui/icons-material/Science';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CommentIcon from '@mui/icons-material/Comment'; // Yorum ikonu

import AddSpotModal from '../components/AddSpotModal';
import { Service } from '../services/api';

// İstatistik Kartı
const StatCard = ({ title, value, icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        whileHover={{ y: -5 }}
    >
        <Paper
            elevation={0}
            sx={{
                p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: `linear-gradient(135deg, ${color[0]}, ${color[1]})`,
                color: 'white', borderRadius: 4, position: 'relative', overflow: 'hidden'
            }}
        >
            <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2, transform: 'rotate(-20deg)' }}>
                {React.cloneElement(icon, { sx: { fontSize: 100, color: 'white' } })}
            </Box>
            <Box zIndex={1}>
                <Typography variant="h3" fontWeight="bold">{value}</Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>{title}</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}>{icon}</Box>
        </Paper>
    </motion.div>
);

const AdminPanel = () => {
    const [tabIndex, setTabIndex] = useState(0);

    // Veri State'leri
    const [stats, setStats] = useState({ active_reservations: 0, available_spots: 0, average_site_rating: 0, total_students: 0 });
    const [spots, setSpots] = useState([]);
    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([]);

    // Modal State'leri
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Analiz State'leri
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analysisTitle, setAnalysisTitle] = useState("");

    // --- YENİ: Yorum Yönetimi State'leri ---
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [currentSpotReviews, setCurrentSpotReviews] = useState([]);
    const [currentSpotName, setCurrentSpotName] = useState("");
    const [currentSpotId, setCurrentSpotId] = useState(null); // Silme sonrası yenilemek için

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            const sData = await Service.getAdminStats();
            setStats(sData);

            const spotsData = await Service.getSpots();
            setSpots(spotsData); // Artık içinde average_rating var

            const uData = await Service.getAllUsers();
            setUsers(uData);

            const rData = await Service.getAllReservations();
            setReservations(rData);
        } catch (error) {
            console.error("Veri yükleme hatası", error);
        }
    };

    // --- ACTIONS ---

    // 1. Mekan Sil
    const handleSpotDelete = async (id) => {
        if (confirm("Mekanı silmek istediğinize emin misiniz?")) {
            await Service.deleteSpot(id);
            loadAllData();
        }
    };

    // 2. Mekan Ekle
    const handleAddSpot = async (data) => {
        await Service.addSpot(data);
        alert("Mekan eklendi.");
        loadAllData();
    };

    // 3. Analiz Yap (Güvenli Mapping ile)
    const handleAnalysis = async (type, title) => {
        try {
            const result = await Service.getAnalysis(type);
            setAnalysisTitle(title);
            setAnalysisResult(result);
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    // --- YENİ: Yorumları Görüntüle ---
    const handleOpenReviews = async (spot) => {
        try {
            setCurrentSpotName(spot.name);
            setCurrentSpotId(spot.id);
            const reviews = await Service.getSpotReviews(spot.id);
            setCurrentSpotReviews(reviews);
            setReviewModalOpen(true);
        } catch (error) {
            alert("Yorumlar yüklenemedi.");
        }
    };

    // --- YENİ: Yorum Sil ---
    const handleReviewDelete = async (reviewId) => {
        if (confirm("Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?")) {
            try {
                await Service.deleteReview(reviewId);
                // Listeden anlık sil (Pencereyi kapatmaya gerek yok)
                setCurrentSpotReviews(currentSpotReviews.filter(r => r.id !== reviewId));
                // Ana tabloyu da güncelle (Ortalama puan değişebilir)
                loadAllData();
            } catch (error) {
                alert("Silme hatası oluştu.");
            }
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b' }}>Yönetim Paneli</Typography>
                    <Typography variant="body2" color="text.secondary">Tüm sistem kontrolü tek ekranda.</Typography>
                </Box>
                <Chip label="Admin Yetkisi Aktif" color="error" variant="outlined" />
            </Box>

            {/* SEKMELER - Yorumlar Sekmesi Kaldırıldı */}
            <Paper elevation={0} sx={{ borderRadius: 4, mb: 4, bgcolor: 'white', border: '1px solid #e2e8f0', p: 0.5 }}>
                <Tabs
                    value={tabIndex} onChange={(e, v) => setTabIndex(v)} centered
                    sx={{ '& .Mui-selected': { bgcolor: '#1e293b', color: 'white !important', borderRadius: 3 } }}
                >
                    <Tab icon={<AssessmentIcon sx={{ mr: 1 }} />} label="Dashboard & Analiz" />
                    <Tab icon={<TableRestaurantIcon sx={{ mr: 1 }} />} label="Mekan Yönetimi" />
                    <Tab icon={<PeopleIcon sx={{ mr: 1 }} />} label="Kullanıcılar" />
                    <Tab icon={<PlaylistAddCheckIcon sx={{ mr: 1 }} />} label="Rezervasyonlar" />
                </Tabs>
            </Paper>

            <AnimatePresence mode="wait">

                {/* --- 1. DASHBOARD & ANALİZ --- */}
                {tabIndex === 0 && (
                    <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Grid container spacing={3}>
                            <Grid item size={{ xs: 12, md: 3 }}><StatCard title="Aktif Rezervasyon" value={stats.active_reservations} icon={<EventSeatIcon />} color={['#6366f1', '#4f46e5']} delay={0.1} /></Grid>
                            <Grid item size={{ xs: 12, md: 3 }}><StatCard title="Mekan Ortalaması" value={stats.average_site_rating} icon={<TrendingUpIcon />} color={['#14b8a6', '#0d9488']} delay={0.2} /></Grid>
                            <Grid item size={{ xs: 12, md: 3 }}><StatCard title="Toplam Öğrenci" value={stats.total_students} icon={<PeopleIcon />} color={['#f59e0b', '#d97706']} delay={0.3} /></Grid>
                            <Grid item size={{ xs: 12, md: 3 }}><StatCard title="Aktif Mekan" value={stats.available_spots} icon={<TableRestaurantIcon />} color={['#ec4899', '#db2777']} delay={0.4} /></Grid>

                            <Grid item size={{ xs: 12 }}>
                                <Paper sx={{ p: 4, borderRadius: 4, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }} elevation={0}>
                                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                                        <Avatar sx={{ bgcolor: '#334155' }}><ScienceIcon /></Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">Kullanıcı Davranış Analizi</Typography>
                                            <Typography variant="caption" color="text.secondary">Sistemi aktif kullananlar ve atıl durumda olanlar</Typography>
                                        </Box>
                                    </Box>

                                    <Grid container spacing={2}>
                                        {/* BUTON 1: GEZGİN GURMELER */}
                                        <Grid item size={{ xs: 12, md: 6 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                sx={{
                                                    bgcolor: '#8b5cf6',
                                                    py: 2,
                                                    '&:hover': { bgcolor: '#7c3aed' }
                                                }}
                                                onClick={() => handleAnalysis('loyal-users', 'Farklı Mekanları Deneyimleyen Sadık Kullanıcılar (Gezginler)')}
                                            >
                                                💎 GEZGİN KULLANICILAR (1 MEKAN)
                                            </Button>
                                        </Grid>

                                        {/* BUTON 2: HAYALET KULLANICILAR */}
                                        <Grid item size={{ xs: 12, md: 6 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                sx={{
                                                    bgcolor: '#64748b',
                                                    py: 2,
                                                    '&:hover': { bgcolor: '#475569' }
                                                }}
                                                onClick={() => handleAnalysis('inactive-users', 'Kayıtlı Olup Hiç Rezervasyon Yapmayanlar (Hayaletler)')}
                                            >
                                                👻 AKTİF OLMAYAN KULLANICILAR
                                            </Button>
                                        </Grid>
                                    </Grid>

                                    {/* Analiz Sonucu Gösterimi */}
                                    {analysisResult && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                                            <Box mt={3} p={3} bgcolor="white" borderRadius={3} border="1px solid #e2e8f0" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
                                                <Typography variant="subtitle1" color="primary" fontWeight="bold" mb={2}>
                                                    🔍 ANALİZ SONUCU:
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" mb={2}>
                                                    {analysisTitle}
                                                </Typography>

                                                {analysisResult.length > 0 ? (
                                                    <Box display="flex" gap={1} flexWrap="wrap">
                                                        {analysisResult.map((u, i) => (
                                                            <Chip
                                                                key={i}
                                                                label={u.name || u}
                                                                avatar={<Avatar sx={{ bgcolor: '#e2e8f0', color: '#1e293b' }}>{(u.name || u).toString().charAt(0)}</Avatar>}
                                                                sx={{ fontWeight: 'bold' }}
                                                            />
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    <Alert severity="info" sx={{ bgcolor: '#f0f9ff' }}>
                                                        Bu kritere uyan kullanıcı bulunamadı.
                                                    </Alert>
                                                )}
                                            </Box>
                                        </motion.div>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {/* --- 2. MEKAN YÖNETİMİ (YENİLENDİ: Yorumlar ve Puan Burada) --- */}
                {tabIndex === 1 && (
                    <motion.div key="spots" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            <Button startIcon={<AddCircleIcon />} variant="contained" onClick={() => setIsAddModalOpen(true)}>Yeni Mekan</Button>
                        </Box>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Ad</TableCell>
                                        <TableCell>Kapasite</TableCell>
                                        <TableCell>Ort. Puan</TableCell>
                                        <TableCell>Yorumlar</TableCell>
                                        <TableCell>Durum</TableCell>
                                        <TableCell>İşlem</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {spots.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell>#{s.id}</TableCell>
                                            <TableCell fontWeight="bold">{s.name}</TableCell>
                                            <TableCell>{s.capacity} Kişi</TableCell>

                                            {/* PUAN GÖSTERİMİ */}
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <Rating value={s.average_rating || 0} readOnly size="small" precision={0.5} />
                                                    <Typography variant="caption" fontWeight="bold">({s.average_rating})</Typography>
                                                </Box>
                                            </TableCell>

                                            {/* YORUM YÖNETİM BUTONU */}
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    startIcon={<CommentIcon />}
                                                    onClick={() => handleOpenReviews(s)}
                                                >
                                                    {s.total_reviews || 0} Yorum
                                                </Button>
                                            </TableCell>

                                            <TableCell>{s.isAvailable ? <Chip label="Aktif" color="success" size="small" /> : <Chip label="Bakımda" color="error" size="small" />}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => handleSpotDelete(s.id)}><DeleteIcon /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <AddSpotModal open={isAddModalOpen} handleClose={() => setIsAddModalOpen(false)} onAdd={handleAddSpot} />
                    </motion.div>
                )}

                {/* --- 3. KULLANICILAR --- */}
                {tabIndex === 2 && (
                    <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8fafc' }}><TableRow><TableCell>Avatar</TableCell><TableCell>Ad Soyad</TableCell><TableCell>Email</TableCell><TableCell>Rol</TableCell><TableCell>Kayıt Tarihi</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {users.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell><Avatar sx={{ width: 30, height: 30, fontSize: 14 }}>{u.name.charAt(0)}</Avatar></TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{u.name}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell><Chip label={u.role} size="small" color={u.role === 'ADMIN' ? 'error' : 'primary'} variant="outlined" /></TableCell>
                                            <TableCell>{u.joined_at}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </motion.div>
                )}

                {/* --- 4. REZERVASYONLAR --- */}
                {tabIndex === 3 && (
                    <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8fafc' }}><TableRow><TableCell>ID</TableCell><TableCell>Öğrenci</TableCell><TableCell>Mekan</TableCell><TableCell>Tarih</TableCell><TableCell>Durum</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {reservations.map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell>#{r.id}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{r.user}</TableCell>
                                            <TableCell>{r.spot}</TableCell>
                                            <TableCell>{r.date} ({r.time})</TableCell>
                                            <TableCell>
                                                <Chip label={r.status} size="small" color={r.status === 'AKTİF' ? 'warning' : r.status === 'TAMAMLANDI' ? 'success' : 'default'} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* --- YORUM YÖNETİM MODALI --- */}
            <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #e2e8f0' }}>
                    {currentSpotName} - Yorum Yönetimi
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {currentSpotReviews.length > 0 ? (
                        <List>
                            {currentSpotReviews.map((rev) => (
                                <Paper key={rev.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                                    <ListItem
                                        secondaryAction={
                                            <Button
                                                variant="outlined" color="error" size="small" startIcon={<DeleteIcon />}
                                                onClick={() => handleReviewDelete(rev.id)}
                                            >
                                                Sil
                                            </Button>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: '#e2e8f0', color: '#1e293b' }}>{rev.username.charAt(0)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography fontWeight="bold">{rev.username}</Typography>
                                                    <Rating value={rev.rating} size="small" readOnly />
                                                    <Typography variant="caption" color="text.secondary">({rev.date})</Typography>
                                                </Box>
                                            }
                                            secondary={rev.comment}
                                        />
                                    </ListItem>
                                </Paper>
                            ))}
                        </List>
                    ) : (
                        <Box textAlign="center" py={5}>
                            <CommentIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
                            <Typography color="text.secondary">Bu mekana ait henüz yorum yapılmamış.</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReviewModalOpen(false)}>Kapat</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default AdminPanel;