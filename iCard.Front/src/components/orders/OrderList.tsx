import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Visibility, Payment, Cancel } from '@mui/icons-material';
import { CheckCircle, Warning } from '@mui/icons-material';
import { OrderService } from '../../services/orders.service';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { OrderDetail } from './OrderDetail';
import { CloseAccountDialog } from './CloseAccountDialogProps';

export const OrderList = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await OrderService.getOrdersByTable(Number(tableId));
        setOrders(data);
      } catch (err) {
        setError('Error al cargar los pedidos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [tableId]);

  const handleOpenDetail = (order: any) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
  };

  const handlePayOrder = async (orderId: number) => {
    try {
      setUpdating(true);
      const response = await OrderService.updateOrderPayment(orderId, {
        paymentStatus: true,
        paymentMethod: 'Cash'
      });

      if (response) {
        setOrders(orders.map(order =>
          order.id === orderId
            ? { ...order, paymentStatus: true, paymentMethod: 'Cash', status: 'Completed' }
            : order
        ));
      }
    } catch (err: any) {
      setError(`Error al procesar el pago: ${err.message}`);
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      setUpdating(true);
      await OrderService.cancelOrder(orderId);

      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'Cancelled' }
          : order
      ));
    } catch (err) {
      setError('Error al cancelar el pedido');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleFreeTableSuccess = async () => {
    try {
      // 1. Limpiar los pedidos locales
      setOrders([]);

      // 2. Redirigir a la vista de mesas con parámetro de recarga
      navigate('/tables', { state: { tableFreed: true } });

      // Opcional: Mostrar mensaje de éxito
      alert('Mesa liberada correctamente. Puede atender a un nuevo cliente.');
    } catch (err) {
      setError('Error al liberar la mesa');
      console.error(err);
    }
  };

  const pendingAmount = orders
    .filter(order => !order.paymentStatus && order.status !== 'Cancelled')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const hasPendingOrders = orders.some(
    order => !order.paymentStatus && order.status !== 'Cancelled'
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Pedidos de la Mesa {orders[0]?.tableNumber || tableId}
      </Typography>

      {orders.length === 0 ? (
        <Typography variant="body1">No hay pedidos para esta mesa</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Pago</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge
                      paid={order.paymentStatus}
                      method={order.paymentMethod}
                    />
                  </TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDetail(order)}
                        title="Ver detalles"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>

                      {!order.paymentStatus && order.status !== 'Cancelled' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handlePayOrder(order.id)}
                            disabled={updating}
                            title="Marcar como pagado"
                          >
                            <Payment fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={updating}
                            title="Cancelar pedido"
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box mt={2}>
        <Button
          variant="contained"
          color={hasPendingOrders ? "warning" : "success"}
          onClick={() => setCloseDialogOpen(true)}
          startIcon={hasPendingOrders ? <Warning /> : <CheckCircle />}
        >
          {hasPendingOrders 
            ? 'Hay pedidos pendientes' 
            : 'Cerrar cuenta y liberar mesa'}
        </Button>

        <CloseAccountDialog
          open={closeDialogOpen}
          onClose={() => setCloseDialogOpen(false)}
          tableId={Number(tableId)}
          totalAmount={pendingAmount}
          onSuccess={handleFreeTableSuccess}
        />
      </Box>

      {selectedOrder && (
        <OrderDetail
          open={detailOpen}
          onClose={handleCloseDetail}
          order={selectedOrder}
          onPay={handlePayOrder}
          onCancel={handleCancelOrder}
          updating={updating}
        />
      )}
    </Box>
  );
};
