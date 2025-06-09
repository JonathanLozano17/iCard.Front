// ProductsPage.tsx
import { Container, Box } from '@mui/material';
import { ProductList } from '../../../components/products/ProductList';
import { useAuth } from '../../../hooks/useAuth';

export const ProductsPage = () => {
  useAuth();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, width: '80vw'  }}>
      <Box display="flex" justifyContent="center">
        <ProductList />
      </Box>
    </Container>
  );
};
