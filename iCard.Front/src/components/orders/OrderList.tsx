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
import { Visibility, Payment } from '@mui/icons-material';
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
      const response = await OrderService.completeOrder(orderId);

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
      setOrders([]);
      alert('Mesa liberada correctamente. Puede atender a un nuevo cliente.');
    } catch (err) {
      setError('Error al liberar la mesa');
      console.error(err);
    }
  };

  // Procesar pagos de todas las órdenes completadas y liberar mesa
  const handleCloseOrPay = async () => {
    try {
      setUpdating(true);
      
      // Filtrar órdenes completadas que no han sido pagadas
      const unpaidCompletedOrders = orders.filter(order => 
        order.status === 'Completed' && !order.paymentStatus
      );

      // Si hay órdenes sin pagar, procesarlas
      if (unpaidCompletedOrders.length > 0) {
        // Procesar pagos para cada orden pendiente
        for (const order of unpaidCompletedOrders) {
          try {
            const paymentDto = {
              paymentMethod: 'Cash' // Solo paymentMethod según la API
            };

            console.log(`Procesando pago para orden ${order.id}`, paymentDto);
            
            const paymentResponse = await OrderService.processPayment(order.id, paymentDto);
            
            console.log(`Pago procesado para orden ${order.id}:`, paymentResponse);

            // Actualizar el estado de la orden en el frontend
            setOrders(prevOrders => 
              prevOrders.map(o => 
                o.id === order.id 
                  ? { ...o, paymentStatus: true, paymentMethod: 'Cash' }
                  : o
              )
            );

          } catch (paymentError: any) {
            console.error(`Error al procesar pago para orden ${order.id}:`, paymentError);
            setError(`Error al procesar pago para orden ${order.id}: ${paymentError.message}`);
            return; // Detener el proceso si hay un error
          }
        }
      }

      // Una vez procesados todos los pagos, liberar la mesa
      handleFreeTableSuccess();

    } catch (err: any) {
      setError(`Error al cerrar cuenta: ${err.message}`);
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // Validación: El botón se activa solo si TODOS los pedidos están completados
  const allOrdersCompleted = orders.length > 0 && orders.every(order => order.status === 'Completed');

  // Calcular el total de la cuenta
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

          {/* Mostrar total de la cuenta */}
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