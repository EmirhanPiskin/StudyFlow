import React, { createContext, useState, useContext } from 'react';

// 1. Context'i oluştur (Boş bir havuz gibi düşün)
const AuthContext = createContext();

// 2. Sağlayıcı (Provider) Bileşeni
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Başlangıçta kimse yok (null)

    // Giriş Yapma Fonksiyonu (Mock Logic)
    const login = (email, password) => {
        // Backend olmadığı için basit bir if-else ile rol atıyoruz
        if (email.includes("admin")) {
            setUser({
                id: 1,
                name: "Yönetici Bey",
                email: email,
                role: "ADMIN"
            });
        } else {
            setUser({
                id: 101,
                name: "Öğrenci Ahmet",
                email: email,
                role: "STUDENT"
            });
        }
        return true; // Giriş başarılı döndük
    };

    // Çıkış Yapma Fonksiyonu
    const logout = () => {
        setUser(null);
    };

    // --- YENİ EKLENEN FONKSİYON: UPDATE İŞLEMİ ---
    const updateProfile = (updatedData) => {
        // Mevcut kullanıcı verisini, yeni gelenle birleştir (Merge)
        setUser((prevUser) => ({
            ...prevUser,
            ...updatedData
        }));
        return true;
    };

    // Bu değerleri tüm uygulamaya açıyoruz
    return (
        <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Kullanımı kolaylaştıran bir kanca (Hook)
export const useAuth = () => useContext(AuthContext);