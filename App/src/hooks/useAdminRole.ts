import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';

export default function useAdminRole() {
  const { user, isAuthenticated, isLoadingSession } = useAuth();
  const router = useRouter();

  const role = user?.rol || user?.role || 'cliente';
  const isAdminOrAux = role === 'administrador' || role === 'auxiliar';

  useEffect(() => {
    if (!isLoadingSession && (!isAuthenticated || !isAdminOrAux)) {
      Alert.alert('Acceso denegado', 'No tienes permisos para acceder a esta sección.');
      router.replace('/');
    }
  }, [isAuthenticated, isLoadingSession, isAdminOrAux, router]);

  return {
    isChecking: isLoadingSession,
    isAuthorized: isAuthenticated && isAdminOrAux,
  };
}
