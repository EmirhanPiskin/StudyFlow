import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Box
} from '@mui/material';

const AddSpotModal = ({ open, handleClose, onAdd }) => {
    // Form Verileri
    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        type: 'Masa', // Varsayılan
        features: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        // 1. Basit Validasyon (Boş mu?)
        if (!formData.name || !formData.capacity) {
            alert("Lütfen isim ve kapasite giriniz!");
            return;
        }

        // 2. Veriyi paketle ve ana sayfaya gönder
        // Features kısmını virgülden ayırıp diziye çeviriyoruz (DB'de array tutuyoruz gibi)
        const newSpot = {
            name: formData.name,
            capacity: parseInt(formData.capacity),
            features: formData.features.split(',').map(f => f.trim()), // "Klima, Priz" -> ["Klima", "Priz"]
            isAvailable: true,
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" // Varsayılan resim
        };

        onAdd(newSpot);

        // Formu temizle
        setFormData({ name: '', capacity: '', type: 'Masa', features: '' });
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
                Yeni Çalışma Alanı Ekle
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

                    <TextField
                        label="Alan Adı (Örn: Kütüphane Masa 5)"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Kapasite (Kişi Sayısı)"
                        name="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <TextField
                        select
                        label="Alan Tipi"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="Masa">Tekli/Çoklu Masa</MenuItem>
                        <MenuItem value="Oda">Grup Çalışma Odası</MenuItem>
                        <MenuItem value="Amfi">Mini Amfi</MenuItem>
                    </TextField>

                    <TextField
                        label="Özellikler (Virgülle ayırın: Priz, Klima...)"
                        name="features"
                        value={formData.features}
                        onChange={handleChange}
                        fullWidth
                        helperText="Örn: Priz Var, Sessiz Alan, Manzaralı"
                    />

                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="error">İptal</Button>
                <Button onClick={handleSubmit} variant="contained" color="success">
                    Kaydet (Insert)
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddSpotModal;