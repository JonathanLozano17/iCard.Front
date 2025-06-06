import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Badge,
  IconButton,
  Paper
} from '@mui/material';
import { Add, Remove, ShoppingCart } from '@mui/icons-material';
import { ProductService } from '../../../services/products.service';
import { CategoryService } from '../../../services/categories.service';
import { OrderService } from '../../../services/orders.service';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageBytes?: string;
  categoryId: number;
  stock: number;
}

interface Category {
  id: number;
  name: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

export const MenuPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          ProductService.getActiveProducts(),
          CategoryService.getActiveCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
        
        if (categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id);
        }
      } catch (err) {
        setError('Error al cargar el menú');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.categoryId === activeCategory && p.stock > 0)
    : [];

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1, notes: '' }];
      }
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.product.id !== productId);
      }
    });
  };

  const handleUpdateNotes = (productId: number, notes: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, notes }
          : item
      )
    );
  };

  const handlePlaceOrder = async () => {
    if (!tableId) return;
  
    if (cart.length === 0) {
      setError('Agregue al menos un producto al carrito');
      return;
    }
  
    try {
      setLoading(true);
      const orderData = {
        tableId: parseInt(tableId),
        customerName,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes
        })),
        notes
      };
  
      await OrderService.createOrder(orderData);
  
      // Limpia el estado tras realizar el pedido
      setSuccess('Pedido realizado con éxito!');
      setCart([]);
      setCustomerName('');
      setNotes('');
  
      // Redirige a la página de pedidos para la mesa
      navigate(`/tables/${tableId}/orders`);
    } catch (err) {
      setError('Error al realizar el pedido');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Menú - Mesa {tableId}
      </Typography>
      
      {/* Notificaciones */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Sección de categorías y productos */}
        <Box sx={{ flex: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {categories.map((category, index) => (
              <Tab
                key={category.id}
                label={category.name}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </Tabs>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {filteredProducts.map(product => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  {product.imageBytes && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={`data:image/jpeg;base64,${product.imageBytes}`}
                      alt={product.name}
                    />
                  )}
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">
                        ${product.price.toFixed(2)}
                      </Typography>
                      {product.stock <= 0 ? (
                        <Chip label="Agotado" color="error" size="small" />
                      ) : (
                        <Button
                          size="small"
                          startIcon={<Add />}
                          onClick={() => handleAddToCart(product)}
                        >
                          Agregar
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Carrito de compras */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={3} sx={{ p: 2, position: 'sticky', top: 16 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Mi Pedido
              </Typography>
              <Badge badgeContent={totalItems} color="primary">
                <ShoppingCart />
              </Badge>
            </Box>

            {cart.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                Su carrito está vacío
              </Typography>
            ) : (
              <>
                <Box sx={{ maxHeight: '400px', overflow: 'auto', mb: 2 }}>
                  {cart.map(item => (
                    <Box key={item.product.id} sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">
                          {item.product.name}
                        </Typography>
                        <Typography>
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          disabled={item.quantity <= 1}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleAddToCart(item.product)}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <TextField
                        label="Notas"
                        size="small"
                        fullWidth
                        value={item.notes}
                        onChange={(e) => handleUpdateNotes(item.product.id, e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  ))}
                </Box>

                <TextField
                  label="Su nombre (opcional)"
                  fullWidth
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Notas del pedido"
                  multiline
                  rows={3}
                  fullWidth
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Typography variant="h6" sx={{ textAlign: 'right', mb: 2 }}>
                  Total: ${totalAmount.toFixed(2)}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Realizar Pedido'}
                </Button>
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};