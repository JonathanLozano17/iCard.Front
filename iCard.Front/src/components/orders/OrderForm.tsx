import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { ProductService } from '../../services/products.service';
import { TableService } from '../../services/tables.service';

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  order: any | null;
}

interface ProductOption {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface TableOption {
  id: number;
  tableNumber: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  notes: string;
}

export const OrderForm = ({ open, onClose, order }: OrderFormProps) => {
  const [tables, setTables] = useState<TableOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableOption | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tablesData, productsData] = await Promise.all([
          TableService.getAllTables(),
          ProductService.getActiveProducts(),
        ]);
        
        setTables(tablesData.map((t: any) => ({ id: t.id, tableNumber: t.tableNumber })));
        setProducts(productsData.map((p: any) => ({ 
          id: p.id, 
          name: p.name, 
          price: p.price,
          stock: p.stock,
        })));

        if (order) {
          setSelectedTable({ id: order.tableId, tableNumber: order.tableNumber });
          setCustomerName(order.customerName || '');
          setNotes(order.notes || '');
          setItems(order.items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            price: item.unitPrice,
            quantity: item.quantity,
            notes: item.notes || '',
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (open) {
      fetchData();
    } else {
      // Reset form when closing
      setSelectedTable(null);
      setCustomerName('');
      setNotes('');
      setItems([]);
      setSelectedProduct(null);
      setQuantity(1);
      setItemNotes('');
      setErrors({});
    }
  }, [open, order]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedTable) newErrors.table = 'Seleccione una mesa';
    if (items.length === 0) newErrors.items = 'Agregue al menos un producto';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (selectedProduct && quantity > 0) {
      const existingItemIndex = items.findIndex(
        item => item.productId === selectedProduct.id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += quantity;
        setItems(updatedItems);
      } else {
        setItems([
          ...items,
          {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            price: selectedProduct.price,
            quantity,
            notes: itemNotes,
          },
        ]);
      }

      setSelectedProduct(null);
      setQuantity(1);
      setItemNotes('');
    }
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const orderData = {
        tableId: selectedTable?.id,
        customerName,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        notes,
      };

      if (order) {
        // Actualizar pedido (si tu backend lo permite)
        // await OrderService.updateOrder(order.id, orderData);
      } else {
        await OrderService.createOrder(orderData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {order ? 'Editar Pedido' : 'Crear Nuevo Pedido'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Autocomplete
            options={tables}
            getOptionLabel={(option) => option.tableNumber}
            value={selectedTable}
            onChange={(_, newValue) => setSelectedTable(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Mesa"
                required
                error={!!errors.table}
                helperText={errors.table}
              />
            )}
            sx={{ flex: 1 }}
            disabled={!!order}
          />

          <TextField
            label="Nombre del cliente"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Productos
        </Typography>
        {errors.items && (
          <Typography color="error" variant="body2" sx={{ mb: 1 }}>
            {errors.items}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Autocomplete
            options={products.filter(p => p.stock > 0)}
            getOptionLabel={(option) => `${option.name} (Stock: ${option.stock})`}
            value={selectedProduct}
            onChange={(_, newValue) => setSelectedProduct(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Seleccionar producto" />
            )}
            sx={{ flex: 2 }}
          />

          <TextField
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            sx={{ flex: 1 }}
          />

          <TextField
            label="Notas del producto"
            value={itemNotes}
            onChange={(e) => setItemNotes(e.target.value)}
            sx={{ flex: 2 }}
          />

          <Button
            variant="contained"
            onClick={handleAddItem}
            disabled={!selectedProduct}
            sx={{ flex: 1 }}
          >
            Agregar
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell>Notas</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell>{item.notes || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Typography variant="h6">
            Total: ${calculateTotal().toFixed(2)}
          </Typography>
        </Box>

        <TextField
          label="Notas del pedido"
          multiline
          rows={3}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {order ? 'Guardar Cambios' : 'Crear Pedido'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};