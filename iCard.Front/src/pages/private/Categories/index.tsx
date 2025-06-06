import { Container } from '@mui/material';
import { CategoryList } from '../../../components/categories/CategoryList';
import { useAuth } from '../../../hooks/useAuth';

export const CategoriesPage = () => {
  useAuth(); // Esto redirigirá si no está autenticado

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <CategoryList />
    </Container>
  );
};