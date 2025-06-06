import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { Box } from '@mui/material';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{ width: 1 }}>
      {children}
    </Box>
  );
};
