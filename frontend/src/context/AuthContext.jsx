import React, { createContext, useState, useContext, useEffect } from 'react';
import { Service } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // 1. Sayfa açılınca LocalStorage'a bak, kullanıcı var mı?
    useEffect(() => {
        const storedUser = localStorage.getItem("studyflow_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email, password) => {
        try {
            const userData = await Service.login(email, password);
            setUser(userData);
            // 2. Giriş yapınca tarayıcı hafızasına kaydet
            localStorage.setItem("studyflow_user", JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error("Giriş Hatası:", error);
            alert("Hatalı e-posta veya şifre!");
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        // 3. Çıkış yapınca hafızadan sil
        localStorage.removeItem("studyflow_user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);