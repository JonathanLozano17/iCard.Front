import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import { StockHistoryService } from '../../services/stockHistory.service';

interface StockHistoryRecord {
  id: number;
  productId: number;
  productName: string;
  previousStock: number;
  newStock: number;
  stockDifference: number;
  changeType: string;
  changedBy: string;
  changedAt: string;
  notes: string;
}

interface StockHistoryProps {
  productId: number;
  productName: string;
  open: boolean;
  onClose: () => void;
}

const changeTypeLabels: Record<string, string> = {
  Initial: 'Inicial',
  Purchase: 'Compra',
  Sale: 'Venta',
  Adjustment: 'Ajuste',
  Waste: 'Merma',
};

const changeTypeColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = {
  Initial: 'primary',
  Purchase: 'success',
  Sale: 'warning',
  Adjustment: 'info',
  Waste: 'error',
};

export const StockHistory = ({ productId, productName, open, onClose }: StockHistoryProps) => {
  const [history, setHistory] = useState<StockHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStockHistory();
    }
  }, [open]);

  const fetchStockHistory = async () => {
    setLoading(true);
    try {
      const data = await StockHistoryService.getProductStockHistory(productId);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Historial de Stock - {productName}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Cargando historial...</Typography>
          </Box>
        ) : history.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>No hay registros de stock para este producto</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell align="right">Stock Anterior</TableCell>
                  <TableCell align="right">Nuevo Stock</TableCell>
                  <TableCell align="right">Diferencia</TableCell>
                  <TableCell>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.changedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={changeTypeLabels[record.changeType] || record.changeType}
                        color={changeTypeColors[record.changeType] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{record.changedBy}</TableCell>
                    <TableCell align="right">{record.previousStock}</TableCell>
                    <TableCell align="right">{record.newStock}</TableCell>
                    <TableCell align="right">
                      <Typography 
                        color={record.stockDifference >= 0 ? 'success.main' : 'error.main'}
                      >
                        {record.stockDifference >= 0 ? '+' : ''}{record.stockDifference}
                      </Typography>
                    </TableCell>
                    <TableCell>{record.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};