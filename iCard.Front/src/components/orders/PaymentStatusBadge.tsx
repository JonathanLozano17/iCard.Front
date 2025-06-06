import { Chip } from '@mui/material';

interface PaymentStatusBadgeProps {
  paid: boolean;
  method?: string;
}

const methodLabels: Record<string, string> = {
  Cash: 'Efectivo',
  CreditCard: 'Tarjeta Crédito',
  DebitCard: 'Tarjeta Débito',
};

export const PaymentStatusBadge = ({ paid, method }: PaymentStatusBadgeProps) => {
  return (
    <Chip 
      label={paid ? (method ? `Pagado (${methodLabels[method] || method})` : 'Pagado') : 'Pendiente'} 
      color={paid ? 'success' : 'warning'}
      size="small"
    />
  );
};