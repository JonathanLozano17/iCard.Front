import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';
import { TableService } from '../../services/tables.service';

interface TableFormProps {
  open: boolean;
  onClose: () => void;
  table: any | null;
}

export const TableForm = ({ open, onClose, table }: TableFormProps) => {
  const [tableNumber, setTableNumber] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (table) {
      setTableNumber(table.tableNumber);
      setDescription(table.description || '');
      setCapacity(table.capacity);
    } else {
      resetForm();
    }
  }, [table]);

  const resetForm = () => {
    setTableNumber('');
    setDescription('');
    setCapacity(4);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!tableNumber.trim()) newErrors.tableNumber = 'El número de mesa es requerido';
    if (isNaN(capacity) || capacity <= 0) newErrors.capacity = 'Capacidad no válida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const tableData = { tableNumber, description, capacity };
      if (table) {
        await TableService.updateTable(table.id, tableData);
      } else {
        await TableService.createTable(tableData);
      }
      onClose();
    } catch (error: any) {
      if (error.message.includes('número de mesa')) {
        setErrors({ tableNumber: 'Este número de mesa ya existe' });
      } else {
        console.error('Error saving table:', error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{table ? 'Editar Mesa' : 'Crear Nueva Mesa'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <TextField
            label="Número de Mesa"
            fullWidth
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            error={!!errors.tableNumber}
            helperText={errors.tableNumber}
            required
          />
          <TextField
            label="Descripción (opcional)"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />
          <TextField
            label="Capacidad"
            type="number"
            fullWidth
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 4)}
            error={!!errors.capacity}
            helperText={errors.capacity}
            required
            inputProps={{ min: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {table ? 'Guardar Cambios' : 'Crear Mesa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
