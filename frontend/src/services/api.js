import axios from 'axios';

// Backend'in çalıştığı adres (FastAPI varsayılanı)
const API_URL = 'http://localhost:8000/api';

// Axios örneği oluşturuyoruz
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- TÜM API İSTEKLERİ BURADA ---

export const Service = {
    // LOGIN FONKSİYONU
    login: async (email, password) => {
        const response = await api.post('/login', { email, password });
        return response.data;
    },

    deleteSpot: async (id) => {
        const response = await api.delete(`/admin/delete-spot/${id}`);
        return response.data;
    },
    // 1. MEKANLARI GETİR (Arama parametresi opsiyonel)
    getSpots: async (searchTerm = '') => {
        // Eğer arama varsa ?q=sessiz gibi istek atar, yoksa düz getirir
        const url = searchTerm ? `/spots?q=${searchTerm}` : '/spots';
        const response = await api.get(url);
        return response.data;
    },

    // 2. REZERVASYON YAP (Trigger Hatası buradan dönebilir)
    createReservation: async (data) => {
        // data şunları içermeli: { userId, spotId, start, end }
        const response = await api.post('/reservations/create', data);
        return response.data;
    },

    // 3. REZERVASYON GEÇMİŞİNİ GETİR
    getHistory: async (userId) => {
        // userId'yi query parametresi olarak gönderiyoruz: ?user_id=2 gibi
        const response = await api.get(`/my-history?user_id=${userId}`);
        return response.data;
    },

    // 4. REZERVASYON İPTAL ET
    cancelReservation: async (id) => {
        const response = await api.delete(`/reservations/${id}`);
        return response.data;
    },

    // 5. PUAN VER (Review Trigger)
    addReview: async (data) => {
        const response = await api.post('/reviews', data);
        return response.data;
    },

    // 6. ADMIN: İSTATİSTİKLERİ GETİR (View)
    getAdminStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // 7. ADMIN: YENİ MEKAN EKLE (Sequence)
    addSpot: async (data) => {
        const response = await api.post('/admin/add-spot', data);
        return response.data;
    },

    // 8. KULLANICI GÜNCELLEME (Update)
    updateUser: async (data) => {
        const response = await api.put('/user/update', data);
        return response.data;
    },

    register: async (data) => {
        const response = await api.post('/register', data);
        return response.data;
    },

    // Admin Analizleri
    getAnalysis: async (type) => {
        // type: 'union', 'intersect', 'except'
        const response = await api.get(`/admin/analysis/${type}`);
        return response.data;
    },

    updateProfile: async (data) => {
        // data şunları içermeli: { userId, username, password }
        const response = await api.put('/profile/update', data);
        return response.data;
    },

    getSpotReviews: async (spotId) => {
        const response = await api.get(`/spots/${spotId}/reviews`);
        return response.data;
    },
    cancelReservation: async (id) => {
        // DELETE yerine PUT kullanıyoruz çünkü veriyi silmiyor, durumunu değiştiriyoruz.
        const response = await api.put(`/reservations/${id}/cancel`);
        return response.data;
    },
    // ADMIN EKSTRALAR
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    getAllReservations: async () => {
        const response = await api.get('/admin/reservations');
        return response.data;
    },
    getAllReviews: async () => {
        const response = await api.get('/admin/reviews');
        return response.data;
    },
    deleteReview: async (id) => {
        const response = await api.delete(`/admin/reviews/${id}`);
        return response.data;
    }
};

export default api;