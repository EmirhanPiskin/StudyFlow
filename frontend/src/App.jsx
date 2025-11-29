import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Birazdan oluşturacağız
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import MyReservations from './pages/MyReservations';
import Profile from './pages/Profile';

function App() {
  return (
    // AuthProvider bütün Router'ı kapsamalı ki her yerden erişelim
    <AuthProvider>
      <Router>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/my-reservations" element={<MyReservations />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;