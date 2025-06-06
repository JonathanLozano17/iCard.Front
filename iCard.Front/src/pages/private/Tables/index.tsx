import { Container } from '@mui/material';
import { TableList } from '../../../components/tables/TableList';
import { useAuth } from '../../../hooks/useAuth';

export const TablesPage = () => {
  useAuth(); // Esto redirigirá si no está autenticado

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <TableList />
    </Container>
  );
};