import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Inventory, History } from '@mui/icons-material';
import { ProductService } from '../../services/products.service';
import { useAuthStore } from '../../stores/auth.store';
import { ProductForm } from './ProductForm';
import { StockHistory } from './StockHistory';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  categoryName: string;
  createdBy: string;
};

export const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { user } = useAuthStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const data =
        user?.role === 'Admin'
          ? await ProductService.getAllProducts()
          : await ProductService.getActiveProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    const tempCategories = Array.from(
      new Map(products.map((p) => [p.categoryName, { id: p.id, name: p.categoryName }])).values()
    );
    setCategories(tempCategories);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || product.categoryName === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenForm = (product: Product | null) => {
    setSelectedProduct(product);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await ProductService.toggleProductStatus(id);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const handleUpdateStock = async (id: number, currentStock: number) => {
    const newStock = prompt('Nuevo stock:', currentStock.toString());
    if (newStock) {
      const notes = prompt('Notas del cambio (opcional):');
      try {
        await ProductService.updateStock(id, {
          quantity: parseInt(newStock),
          notes: notes || undefined,
        });
        fetchProducts();
      } catch (error) {
        console.error('Error updating stock:', error);
      }
    }
  };

  const handleOpenHistory = (productId: number, productName: string) => {
    setSelectedProductForHistory({ id: productId, name: productName });
    setOpenHistory(true);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Gestión de Productos</Typography>
        {user?.role === 'Admin' && (
          <Tooltip title="Agregar nuevo producto">
            <IconButton color="primary" onClick={() => handleOpenForm(null)}>
              <Add /> Nuevo Producto
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Buscar productos"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flexGrow: 1 }}
        />
        <TextField
          select
          label="Categoría"
          value={categoryFilter}
          onChange={handleCategoryFilterChange}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Todas las categorías</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.name}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>
                    {product.stock <= 0 ? (
                      <Chip label="Agotado" color="error" size="small" />
                    ) : (
                      product.stock
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.isActive ? 'Activo' : 'Inactivo'}
                      color={product.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleOpenForm(product)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user?.role === 'Admin' && (
                        <>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenForm(product)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={product.isActive ? 'Desactivar' : 'Activar'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(product.id)}
                              color={product.isActive ? 'error' : 'success'}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ajustar stock">
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateStock(product.id, product.stock)}
                            >
                              <Inventory fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver historial de stock">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenHistory(product.id, product.name)}
                            >
                              <History fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredProducts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Productos por página:"
      />

      <ProductForm
        open={openForm}
        onClose={handleCloseForm}
        product={selectedProduct}
      />

      {selectedProductForHistory && (
        <StockHistory
          productId={selectedProductForHistory.id}
          productName={selectedProductForHistory.name}
          open={openHistory}
          onClose={() => setOpenHistory(false)}
        />
      )}
    </Box>
  );
};
