import { useState } from 'react';
import { TableService } from '../../services/tables.service'; // ✅ Usa el servicio correcto
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { DialogTitle } from '@mui/material';

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
      await TableService.freeTable(tableId); // ✅ Llama al método correcto
      onSuccess(); // ✅ Actualiza lista de mesas
    } catch (error) {
      console.error('Error al liberar la mesa:', error);
    } finally {
      setLoading(false);
      onClose(); // Opcional: cierra el diálogo después de liberar
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Liberar Mesa</DialogTitle>
      <DialogContent>
        <Typography>¿Está seguro de liberar esta mesa para nuevos clientes?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleFreeTable} 
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Liberar Mesa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
