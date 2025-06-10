import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { Visibility, Payment, CheckCircle, Warning } from '@mui/icons-material';
import { OrderService } from '../../services/orders.service';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { OrderDetail } from './OrderDetail';
import { CloseAccountDialog } from './CloseAccountDialogProps';

export const OrderList = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

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

  useEffect(() => {
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
      await OrderService.completeOrder(orderId);
      await fetchOrders(); // Recargar las órdenes después de completar
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
      // Podrías implementar una API real aquí
      await fetchOrders();
    } catch (err) {
      setError('Error al cancelar el pedido');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleFreeTableSuccess = async () => {
    try {
      setOrders([]);
      alert('Mesa liberada correctamente. Puede atender a un nuevo cliente.');
    } catch (err) {
      setError('Error al liberar la mesa');
      console.error(err);
    }
  };

  const handleCloseOrPay = async () => {
    try {
      setUpdating(true);

      const unpaidCompletedOrders = orders.filter(order =>
        order.status === 'Completed' && !order.paymentStatus
      );

      if (unpaidCompletedOrders.length > 0) {
        for (const order of unpaidCompletedOrders) {
          try {
            const paymentDto = { paymentMethod: 'Cash' };
            await OrderService.processPayment(order.id, paymentDto);
          } catch (paymentError: any) {
            console.error(`Error al procesar pago para orden ${order.id}:`, paymentError);
            setError(`Error al procesar pago para orden ${order.id}: ${paymentError.message}`);
            return;
          }
        }
      }

      await fetchOrders(); // Recargar pedidos después de pagos
      handleFreeTableSuccess();

    } catch (err: any) {
      setError(`Error al cerrar cuenta: ${err.message}`);
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const allOrdersCompleted =
    orders.length > 0 && orders.every(order => order.status === 'Completed');

  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

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
        <>
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
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handlePayOrder(order.id)}
                            disabled={updating}
                            title="Completar Orden"
                          >
                            <Payment fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1}>
            <Typography variant="h6">
              Total de la cuenta: ${totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </>
      )}

      <Box mt={2}>
        <Button
          variant="contained"
          color={allOrdersCompleted ? "success" : "warning"}
          onClick={handleCloseOrPay}
          startIcon={allOrdersCompleted ? <CheckCircle /> : <Warning />}
          disabled={!allOrdersCompleted || updating}
          size="large"
        >
          {updating
            ? 'Procesando...'
            : allOrdersCompleted
            ? 'Cerrar cuenta y liberar mesa'
            : 'Solo se puede cerrar si todos están completados'}
        </Button>

        <CloseAccountDialog
          open={closeDialogOpen}
          onClose={() => setCloseDialogOpen(false)}
          tableId={Number(tableId)}
          totalAmount={totalAmount}
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
