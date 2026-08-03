import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import SuccessBanner from '../components/SuccessBanner';

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [saving, setSaving] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: user.direccion || ''
      });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente' });
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      const msg = err.response?.data?.message || err.message || 'Error al actualizar perfil';
      setMensaje({ tipo: 'danger', texto: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.actual || !passwords.nueva) {
      setMensaje({ tipo: 'warning', texto: 'Completa las contraseñas' });
      return;
    }
    if (passwords.nueva !== passwords.confirmar) {
      setMensaje({ tipo: 'warning', texto: 'La nueva contraseña y su confirmación no coinciden' });
      return;
    }

    setPwdLoading(true);
    try {
      await authService.changePassword(passwords.actual, passwords.nueva);
      setMensaje({ tipo: 'success', texto: 'Contraseña cambiada correctamente' });
      setPasswords({ actual: '', nueva: '', confirmar: '' });
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      const msg = err.response?.data?.message || err.message || 'Error al cambiar contraseña';
      setMensaje({ tipo: 'danger', texto: msg });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-3">Mi Perfil</h3>
              {mensaje.texto && mensaje.tipo === 'success' && (
                <SuccessBanner message={mensaje.texto} onClose={() => setMensaje({ tipo: '', texto: '' })} className="mb-3" />
              )}
              {mensaje.texto && mensaje.tipo !== 'success' && (
                <div className={`alert alert-${mensaje.tipo} mb-3`} role="alert">
                  {mensaje.texto}
                </div>
              )}
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} className="form-control" required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input name="email" value={form.email} onChange={handleChange} className="form-control" type="email" required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} className="form-control" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <textarea name="direccion" value={form.direccion} onChange={handleChange} className="form-control" rows="2" />
                </div>

                <div className="d-flex justify-content-end">
                  <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                </div>
              </form>

              <hr />

              <h5>Cambiar contraseña</h5>
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label">Contraseña actual</label>
                  <input type="password" className="form-control" value={passwords.actual} onChange={(e) => setPasswords({...passwords, actual: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nueva contraseña</label>
                  <input type="password" className="form-control" value={passwords.nueva} onChange={(e) => setPasswords({...passwords, nueva: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar nueva contraseña</label>
                  <input type="password" className="form-control" value={passwords.confirmar} onChange={(e) => setPasswords({...passwords, confirmar: e.target.value})} required />
                </div>
                <div className="d-flex justify-content-end">
                  <button className="btn btn-outline-secondary" type="submit" disabled={pwdLoading}>{pwdLoading ? 'Procesando...' : 'Cambiar contraseña'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
