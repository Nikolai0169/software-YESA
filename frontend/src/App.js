/**
 * ============================================
 * COMPONENTE PRINCIPAL DE LA APLICACIÓN
 * ============================================
 * Configuración de rutas y contexto global
 */

import React from 'react';
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
import CarritoPage from './pages/CarritoPage';
import CheckoutPage from './pages/CheckoutPage';
import PedidoConfirmadoPage from './pages/PedidoConfirmadoPage';
import MisPedidosPage from './pages/MisPedidosPage';

// Páginas de administración
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCategoriasPage from './pages/admin/AdminCategoriasPage';
import AdminSubcategoriasPage from './pages/admin/AdminSubcategoriasPage';
import AdminProductosPage from './pages/admin/AdminProductosPage';
import AdminUsuariosPage from './pages/AdminUsuariosPage';
import AdminPedidosPage from './pages/AdminPedidosPage';
import AdminCotizacionesPage from './pages/admin/AdminCotizacionesPage';
import AdminCotizacionDetallePage from './pages/admin/AdminCotizacionDetallePage';
import ProfilePage from './pages/ProfilePage';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          
          <main className="flex-grow-1">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/catalogo" element={<CatalogoPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/favoritos" element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              } />
              <Route path="/personalizacion" element={<PersonalizacionPage />} />
              <Route path="/disenos-guardados" element={<SavedDesignsPage />} />
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
              
              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
