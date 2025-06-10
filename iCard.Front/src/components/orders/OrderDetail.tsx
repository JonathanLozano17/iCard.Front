import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  CircularProgress,
} from '@mui/material';
import { useState } from 'react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { OrderService } from '../../services/orders.service';

interface OrderDetailProps {
  open: boolean;
  onClose: () => void;
  order: any;
  onOrderCompleted?: () => void;
}

export const OrderDetail = ({
  open,
  onClose,
  order,
  onOrderCompleted,
}: OrderDetailProps) => {
  const [loading, setLoading] = useState(false);

  const handleCompleteOrder = async () => {
    try {
      setLoading(true);
      await OrderService.completeOrder(order.id);
      onOrderCompleted?.(); // Optional callback for parent updates
      onClose(); // Optionally close the dialog
    } catch (error) {
      console.error('Error al completar la orden:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalles del Pedido #{order.id}</DialogTitle>
      <DialogContent>
        {/* Información General */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Información General
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Mesa</Typography>
              <Typography variant="body1">{order.tableNumber}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Cliente</Typography>
              <Typography variant="body1">
                {order.customerName || 'No especificado'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Estado</Typography>
              <OrderStatusBadge status={order.status} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Pago</Typography>
              <PaymentStatusBadge
                paid={order.paymentStatus}
                method={order.paymentMethod}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Fecha creación</Typography>
              <Typography variant="body1">
                {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Última actualización</Typography>
              <Typography variant="body1">
                {new Date(order.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          {order.notes && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">Notas</Typography>
              <Typography variant="body1">{order.notes}</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Productos */}
        <Typography variant="subtitle1" gutterBottom>Productos</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell>Notas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item: any) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.subtotal.toFixed(2)}</TableCell>
                  <TableCell>{item.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="h6">Total: ${order.totalAmount.toFixed(2)}</Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        {order.status !== 'Cancelled' && !order.paymentStatus && (
          <Button
            onClick={handleCompleteOrder}
            color="success"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Completar Orden'}
          </Button>
        )}
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};
