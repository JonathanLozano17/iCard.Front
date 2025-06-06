import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { TableService } from '../../services/tables.service';
import { OrderService } from '../../services/orders.service';

interface Order {
  id: number;
  paymentStatus: boolean;
  status: string;
  totalAmount: number;
}

interface CloseAccountDialogProps {
  open: boolean;
  onClose: () => void;
  tableId: number;
  totalAmount: number;
  onSuccess: () => Promise<void>;
}

export const CloseAccountDialog = ({
  open,
  onClose,
  tableId,
  totalAmount,
  onSuccess
}: CloseAccountDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const tableOrders = await OrderService.getOrdersByTable(tableId);
        setOrders(tableOrders);
      } catch (err) {
        setError('Error al cargar las órdenes: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      }
    };

    if (open) {
      fetchOrders();
    }
  }, [open, tableId]);

  const totalOrdersAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const cancelledOrdersAmount = orders
    .filter((o) => o.status === 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingAmount = totalOrdersAmount - cancelledOrdersAmount;

  const handleCloseAccount = async () => {
    try {
      setLoading(true);

      // 1. Registrar el cierre de cuenta y marcar pedidos como pagados
      await OrderService.closeAccount(tableId, {
        paymentMethod,
        totalAmount: pendingAmount
      });

      // 2. Liberar la mesa
      await TableService.freeTable(tableId);

      // 3. Ejecutar callback de éxito
      await onSuccess();

      // 4. Cerrar el diálogo
      onClose();
    } catch (err) {
      setError('Error al cerrar la cuenta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cerrar Cuenta - Mesa {tableId}</DialogTitle>
      <DialogContent>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Resumen de Cuenta
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Total pedidos:</Typography>
            <Typography>${totalOrdersAmount.toFixed(2)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Pedidos cancelados:</Typography>
            <Typography>-${cancelledOrdersAmount.toFixed(2)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="subtitle1">Total a pagar:</Typography>
            <Typography variant="subtitle1">${pendingAmount.toFixed(2)}</Typography>
          </Box>
        </Box>

        <Box mb={3}>
          <TextField
            select
            label="Método de Pago"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            fullWidth
            variant="outlined"
          >
            <MenuItem value="Cash">Efectivo</MenuItem>
            <MenuItem value="CreditCard">Tarjeta de Crédito</MenuItem>
            <MenuItem value="DebitCard">Tarjeta de Débito</MenuItem>
          </TextField>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleCloseAccount}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirmar Pago y Liberar Mesa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
