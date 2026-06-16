/**
 * ============================================
 * COMPONENTE PRINCIPAL DE LA APLICACIÓN
 * ============================================
 * Configuración de rutas y contexto global
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogoPage from './pages/CatalogoPage';
import ProductDetailPage from './pages/ProductDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import PersonalizacionPage from './pages/personalizacion';
import SavedDesignsPage from './pages/SavedDesignsPage';
import MyCotizacionesPage from './pages/MyCotizacionesPage';
import MyCotizacionDetallePage from './pages/MyCotizacionDetallePage';
import CarritoPage from './pages/CarritoPage';
import CheckoutPage from './pages/CheckoutPage';
import PedidoConfirmadoPage from './pages/PedidoConfirmadoPage';
import MisPedidosPage from './pages/MisPedidosPage';
import MisConsultasPage from './pages/MisConsultasPage';

// Páginas de administración
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCategoriasPage from './pages/admin/AdminCategoriasPage';
import AdminSubcategoriasPage from './pages/admin/AdminSubcategoriasPage';
import AdminProductosPage from './pages/admin/AdminProductosPage';
import AdminUsuariosPage from './pages/AdminUsuariosPage';
import AdminPedidosPage from './pages/AdminPedidosPage';
import AdminCotizacionesPage from './pages/admin/AdminCotizacionesPage';
import AdminCotizacionDetallePage from './pages/admin/AdminCotizacionDetallePage';
import AdminSoportePage from './pages/admin/AdminSoportePage';
import ProductReviewsPage from './pages/ProductReviewsPage';
import ProductReviewFormPage from './pages/ProductReviewFormPage';
import ProfilePage from './pages/ProfilePage';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('yesa-theme');
    const initialTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    document.body.classList.toggle('theme-dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('yesa-theme', nextTheme);
      document.body.classList.toggle('theme-dark', nextTheme === 'dark');
      return nextTheme;
    });
  };

  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          
          <main className="flex-grow-1">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/catalogo" element={<CatalogoPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/producto/:id/resenas" element={<ProductReviewsPage />} />
              <Route path="/producto/:id/escribir-resena" element={<ProductReviewFormPage />} />
              <Route path="/mis-consultas" element={<MisConsultasPage />} />
              <Route path="/favoritos" element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              } />
              <Route path="/personalizacion" element={<PersonalizacionPage />} />
              <Route path="/disenos-guardados" element={<SavedDesignsPage />} />
              <Route path="/mis-cotizaciones" element={
                <ProtectedRoute>
                  <MyCotizacionesPage />
                </ProtectedRoute>
              } />
              <Route path="/mis-cotizaciones/:id" element={
                <ProtectedRoute>
                  <MyCotizacionDetallePage />
                </ProtectedRoute>
              } />
              <Route path="/carrito" element={<CarritoPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/pedido-confirmado/:id" element={<PedidoConfirmadoPage />} />
              <Route path="/mis-pedidos" element={<MisPedidosPage />} />
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Rutas de administración - PROTEGIDAS */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/categorias" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminCategoriasPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/subcategorias" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminSubcategoriasPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/productos" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminProductosPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/usuarios" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminUsuariosPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/pedidos" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPedidosPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/cotizaciones" element={
                <ProtectedRoute requireAdminOnly={true}>
                  <AdminCotizacionesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/cotizaciones/:id" element={
                <ProtectedRoute requireAdminOnly={true}>
                  <AdminCotizacionDetallePage />
                </ProtectedRoute>
              } />
              
              {/* RUTA - PANEL DE SOPORTE */}
              <Route path="/admin/soporte" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminSoportePage />
                </ProtectedRoute>
              } />
              
              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer onOpenFAQ={() => {}} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;