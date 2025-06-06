import { Container } from '@mui/material';
import { OrderList } from '../../../components/orders/OrderList';
import { useAuth } from '../../../hooks/useAuth';

export const OrdersPage = () => {
  useAuth(); // Esto redirigirá si no está autenticado

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <OrderList />
    </Container>
  );
};