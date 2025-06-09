// src/pages/dashboard/DashboardPage.tsx
import { Container } from '@mui/material';
import { DashboardSummary } from '../../../components/dashboard/DashboardSummary';
import { SalesReport } from '../../../components/dashboard/SalesReport';
import { TopProducts } from '../../../components/dashboard/TopProducts';
import { useAuth } from '../../../hooks/useAuth';

export const DashboardPage = () => {
  useAuth(); // Esto redirigirá si no está autenticado

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '80vh' }}>
      <DashboardSummary />
      <SalesReport />
      <TopProducts />
    </Container>
  );
};