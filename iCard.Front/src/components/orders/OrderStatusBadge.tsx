import { Chip } from '@mui/material';

type OrderStatus = 'Pending' | 'InProgress' | 'Completed' | 'Delivered' | 'Cancelled';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusColors: Record<OrderStatus, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = {
  Pending: 'warning',
  InProgress: 'info',
  Completed: 'primary',
  Delivered: 'success',
  Cancelled: 'error',
};

const statusLabels: Record<OrderStatus, string> = {
  Pending: 'Pendiente',
  InProgress: 'En preparación',
  Completed: 'Completado',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
};

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  return (
    <Chip 
      label={statusLabels[status]} 
      color={statusColors[status]}
      size="small"
    />
  );
};