// Bu veriler sanki veritabanından (PostgreSQL) gelmiş gibi davranacağız.

export const mockStudySpots = [
    {
        id: 1,
        name: "Kütüphane - Ana Salon - Masa 12",
        capacity: 4,
        features: ["Priz Var", "Sessiz Alan", "Klima"],
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 2,
        name: "Çalışma Odası B (Grup)",
        capacity: 6,
        features: ["Projeksiyon", "Beyaz Tahta", "Sesli Çalışılabilir"],
        isAvailable: false, // Dolu örneği
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 3,
        name: "Bahçe Alanı - Tekli Masa",
        capacity: 1,
        features: ["Açık Hava", "Wifi Zayıf"],
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80"
    }
];

export const mockUser = {
    id: 101,
    name: "Ahmet Yılmaz",
    role: "STUDENT", // veya 'ADMIN'
    score: 450 // Verimlilik puanı
};