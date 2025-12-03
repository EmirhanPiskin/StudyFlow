import React, { useState } from 'react';
import {
    Container, Typography, Box, Tabs, Tab, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Chip, Grid, Avatar
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// İkonlar
import DeleteIcon from '@mui/icons-material/DeleteOutline'; // Daha ince ikon
import AddCircleIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PeopleIcon from '@mui/icons-material/People';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScienceIcon from '@mui/icons-material/Science'; // Analiz için

// Bileşenler ve Veri
import AddSpotModal from '../components/AddSpotModal';
import { mockStudySpots } from '../services/mockData';

// --- (StatCard Bileşenini buraya veya yukarıya yapıştırdığını varsayıyorum) ---
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
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${color[0]}, ${color[1]})`,
                color: 'white',
                borderRadius: 4,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2, transform: 'rotate(-20deg)' }}>
                {React.cloneElement(icon, { sx: { fontSize: 100, color: 'white' } })}
            </Box>
            <Box zIndex={1}>
                <Typography variant="h3" fontWeight="bold">{value}</Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>{title}</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}>
                {icon}
            </Box>
        </Paper>
    </motion.div>
);

const AdminPanel = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [spots, setSpots] = useState(mockStudySpots);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleTabChange = (event, newValue) => setTabIndex(newValue);

    const handleDelete = (id) => {
        if (window.confirm("Bu alanı silmek istediğinize emin misiniz?")) {
            setSpots(spots.filter(s => s.id !== id));
        }
    };

    const handleAddSpot = (newSpotData) => {
        const newId = spots.length > 0 ? Math.max(...spots.map(s => s.id)) + 1 : 1;
        setSpots([...spots, { ...newSpotData, id: newId }]);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>

            {/* BAŞLIK ALANI */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b' }}>
                        Yönetim Paneli
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sistem istatistikleri ve mekan yönetimi
                    </Typography>
                </Box>
                {/* Kullanıcıya ufak bir tarih göstergesi */}
                <Chip label={new Date().toLocaleDateString('tr-TR')} variant="outlined" />
            </Box>

            {/* MODERN SEKMELER */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    mb: 4,
                    bgcolor: 'white',
                    border: '1px solid #e2e8f0',
                    p: 0.5
                }}
            >
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    centered
                    TabIndicatorProps={{ sx: { height: 0 } }} // Alt çizgiyi gizle
                    sx={{
                        '& .Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white !important',
                            borderRadius: 3
                        },
                        '& .MuiTab-root': {
                            borderRadius: 3,
                            transition: 'all 0.3s',
                            mx: 1
                        }
                    }}
                >
                    <Tab icon={<AssessmentIcon sx={{ mb: 0, mr: 1 }} />} iconPosition="start" label="Dashboard" />
                    <Tab icon={<TableRestaurantIcon sx={{ mb: 0, mr: 1 }} />} iconPosition="start" label="Mekan Yönetimi" />
                </Tabs>
            </Paper>

            {/* İÇERİK ALANI (AnimatePresence ile geçiş efekti) */}
            <AnimatePresence mode="wait">

                {/* --- SEKME 1: DASHBOARD --- */}
                {tabIndex === 0 && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid container spacing={3}>
                            <Grid item size={{ xs: 12, md: 4 }}>
                                <StatCard
                                    title="Aktif Rezervasyon"
                                    value="12"
                                    icon={<EventSeatIcon />}
                                    color={['#6366f1', '#4f46e5']} // Indigo Gradient
                                    delay={0.1}
                                />
                            </Grid>
                            <Grid item size={{ xs: 12, md: 4 }}>
                                <StatCard
                                    title="Ortalama Puan"
                                    value="4.8"
                                    icon={<TrendingUpIcon />}
                                    color={['#14b8a6', '#0d9488']} // Teal Gradient
                                    delay={0.2}
                                />
                            </Grid>
                            <Grid item size={{ xs: 12, md: 4 }}>
                                <StatCard
                                    title="Kayıtlı Öğrenci"
                                    value="345"
                                    icon={<PeopleIcon />}
                                    color={['#f59e0b', '#d97706']} // Orange Gradient
                                    delay={0.3}
                                />
                            </Grid>

                            {/* ANALİZ BUTONLARI */}
                            <Grid item size={{ xs: 12 }} sx={{ mt: 2 }}>
                                <Paper sx={{ p: 4, borderRadius: 4, border: '1px dashed #cbd5e1' }} elevation={0}>
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Avatar sx={{ bgcolor: 'secondary.light' }}><ScienceIcon /></Avatar>
                                        <Typography variant="h6" fontWeight="bold">Özel Veritabanı Analizleri</Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        {['Tüm Salonları Kullananlar (UNION)', 'Sadık Öğrenciler (INTERSECT)', 'Pasif Kullanıcılar (EXCEPT)'].map((text, i) => (
                                            <Grid item size={{ xs: 12, sm: 4 }} key={i}>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    sx={{
                                                        justifyContent: 'flex-start',
                                                        py: 1.5,
                                                        borderRadius: 2,
                                                        borderColor: '#cbd5e1',
                                                        color: '#475569',
                                                        '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: '#f1f5f9' }
                                                    }}
                                                    onClick={() => alert("Sorgu veritabanına gönderildi.")}
                                                >
                                                    {text}
                                                </Button>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {/* --- SEKME 2: YÖNETİM --- */}
                {tabIndex === 1 && (
                    <motion.div
                        key="management"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box display="flex" justifyContent="flex-end" mb={3}>
                            <Button
                                variant="contained"
                                startIcon={<AddCircleIcon />}
                                onClick={() => setIsAddModalOpen(true)}
                                sx={{
                                    borderRadius: 3,
                                    px: 3, py: 1,
                                    background: 'linear-gradient(45deg, #4f46e5 30%, #6366f1 90%)',
                                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
                                }}
                            >
                                Yeni Alan Ekle
                            </Button>
                        </Box>

                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        {['ID', 'Alan Adı', 'Kapasite', 'Özellikler', 'Durum', 'İşlemler'].map((head) => (
                                            <TableCell key={head} sx={{ fontWeight: 'bold', color: '#64748b' }}>{head}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {spots.map((spot) => (
                                        <TableRow key={spot.id} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: '0.2s' }}>
                                            <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>#{spot.id}</TableCell>
                                            <TableCell>{spot.name}</TableCell>
                                            <TableCell>
                                                <Chip label={`${spot.capacity} Kişi`} size="small" sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 'bold' }} />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                                    {spot.features.slice(0, 2).map((f, i) => (
                                                        <Chip key={i} label={f} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                                                    ))}
                                                    {spot.features.length > 2 && <Chip label={`+${spot.features.length - 2}`} size="small" sx={{ fontSize: 10, height: 20 }} />}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {spot.isAvailable ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                                                    <Typography variant="caption" fontWeight="bold" color={spot.isAvailable ? 'success.main' : 'error.main'}>
                                                        {spot.isAvailable ? 'Aktif' : 'Dolu'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(spot.id)}
                                                    sx={{ color: '#ef4444', bgcolor: '#fee2e2', '&:hover': { bgcolor: '#fecaca' } }}
                                                >
                                                    <DeleteIcon fontSize="small" />
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
                    </motion.div>
                )}
            </AnimatePresence>
        </Container>
    );
};

export default AdminPanel;