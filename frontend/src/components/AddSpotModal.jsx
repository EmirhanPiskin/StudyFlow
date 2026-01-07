import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, IconButton, Typography, Stack,
    FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';

const AddSpotModal = ({ open, handleClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        features: '', // Virgülle ayrılmış string olarak alacağız
        image_url: '' // Base64 string buraya gelecek
    });

    const [preview, setPreview] = useState(null);

    // Resim Seçme ve Base64 Çevirme Fonksiyonu
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // reader.result içinde "data:image/jpeg;base64,..." formatında resim var
                setFormData({ ...formData, image_url: reader.result });
                setPreview(reader.result);
            };
            reader.readAsDataURL(file); // Sihirli kod burası
        }
    };

    const handleSubmit = () => {
        // 1. Özellikleri listeye çevir
        const featureList = formData.features.split(',').map(f => f.trim()).filter(f => f !== '');

        // 2. Kapasite kontrolü (Eğer sayı değilse veya boşsa hata vermemesi için 0 veya varsayılan değer ata)
        let safeCapacity = parseInt(formData.capacity);
        if (isNaN(safeCapacity)) {
            alert("Lütfen geçerli bir kapasite sayısı giriniz.");
            return; // İşlemi durdur
        }

        const dataToSend = {
            name: formData.name,
            capacity: safeCapacity, // Güvenli sayı
            features: featureList,
            image_url: formData.image_url || "", // Eğer null ise boş string gönder
            type: "Library",
            is_available: true
        };

        // Backend'e gönder
        onAdd(dataToSend);

        // Temizlik
        setFormData({ name: '', capacity: '', features: '', image_url: '' });
        setPreview(null);
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
                Yeni Mekan Ekle
                <IconButton onClick={handleClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3} mt={1}>
                    <TextField
                        label="Mekan Adı" fullWidth variant="outlined"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <TextField
                        label="Kapasite (Kişi Sayısı)" type="number" fullWidth variant="outlined"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />

                    <TextField
                        label="Özellikler (Virgülle ayırın: Wifi, Priz...)" fullWidth variant="outlined"
                        helperText="Örn: Sessiz, Wifi, Priz, Klima"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    />

                    {/* RESİM YÜKLEME ALANI */}
                    <Box border="1px dashed #ccc" p={3} borderRadius={2} textAlign="center">
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="icon-button-file"
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="icon-button-file">
                            <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                                Mekan Görseli Yükle
                            </Button>
                        </label>

                        {preview ? (
                            <Box mt={2}>
                                <img src={preview} alt="Önizleme" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                                <Typography variant="caption" display="block">Görsel Seçildi</Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Veya boş bırakırsanız varsayılan görsel kullanılır.
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="inherit">İptal</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || !formData.capacity}>
                    Kaydet
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddSpotModal;