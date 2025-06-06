import { useState } from 'react';
import { TableService } from '../../services/tables.service';
import { OrderService } from '../../services/orders.service';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { MeetingRoom } from '@mui/icons-material'; 

interface Props {
  open: boolean;
  tableId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const FreeTableDialog = ({ open, tableId, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleFreeTable = async () => {
    try {
      setLoading(true);
      await OrderService.freeTable(tableId); // Nuevo método en el servicio
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Liberar Mesa</DialogTitle>
      <DialogContent>
        <Typography>¿Está seguro de liberar esta mesa para nuevos clientes?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleFreeTable} 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Liberar Mesa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};