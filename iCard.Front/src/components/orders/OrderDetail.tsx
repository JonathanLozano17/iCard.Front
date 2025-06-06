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
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface OrderDetailProps {
  open: boolean;
  onClose: () => void;
  order: any;
  onPay?: (orderId: number) => void;
  onCancel?: (orderId: number) => void;
  updating?: boolean;
}

export const OrderDetail = ({
  open,
  onClose,
  order,
  onPay,
  onCancel,
  updating = false,
}: OrderDetailProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalles del Pedido #{order.id}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Información General
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Mesa
              </Typography>
              <Typography variant="body1">{order.tableNumber}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Cliente
              </Typography>
              <Typography variant="body1">
                {order.customerName || 'No especificado'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Estado
              </Typography>
              <OrderStatusBadge status={order.status} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Pago
              </Typography>
              <PaymentStatusBadge
                paid={order.paymentStatus}
                method={order.paymentMethod}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Fecha creación
              </Typography>
              <Typography variant="body1">
                {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Última actualización
              </Typography>
              <Typography variant="body1">
                {new Date(order.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          {order.notes && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Notas
              </Typography>
              <Typography variant="body1">{order.notes}</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Productos
        </Typography>
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
                  <TableCell align="right">
                    ${item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    ${item.subtotal.toFixed(2)}
                  </TableCell>
                  <TableCell>{item.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="h6">
            Total: ${order.totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        {order.status !== 'Cancelled' && !order.paymentStatus && (
          <>
            <Button
              onClick={() => onCancel?.(order.id)}
              color="error"
              disabled={updating}
            >
              {updating ? <CircularProgress size={24} /> : 'Cancelar Pedido'}
            </Button>
            <Button
              onClick={() => onPay?.(order.id)}
              color="success"
              variant="contained"
              disabled={updating}
            >
              {updating ? <CircularProgress size={24} /> : 'Marcar como Pagado'}
            </Button>
          </>
        )}
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};
