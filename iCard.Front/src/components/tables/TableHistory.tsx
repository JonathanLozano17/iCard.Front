import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  TablePagination,
  Collapse,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { TableService } from '../../services/tables.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type TableHistoryProps = {
  tableId: number;
};

export const TableHistory: React.FC<TableHistoryProps> = ({ tableId }) => {
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedBills, setExpandedBills] = useState<number[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await TableService.getTableHistory(tableId, fromDate);
        // La respuesta es un array de facturas, vamos a construir un objeto con tableNumber y totalRevenue
        if (data.length === 0) {
          setHistory(null);
          return;
        }

        const totalRevenue = data.reduce((acc: number, bill: any) => acc + bill.totalAmount, 0);

        setHistory({
          tableNumber: tableId.toString(),
          totalRevenue,
          bills: data,
        });
      } catch (err) {
        setError('Error al cargar el historial');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [tableId, fromDate]);

  const handleToggleExpand = (billId: number) => {
    setExpandedBills(prev =>
      prev.includes(billId)
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  if (!history) {
    return (
      <Box p={2}>
        <Alert severity="info">No se encontró historial para esta mesa</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h2">
          Historial de Mesa {history.tableNumber}
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Desde"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <Typography variant="subtitle1" whiteSpace="nowrap">
            Total facturado: ${history.totalRevenue.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small" aria-label="historial de mesa">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Método de Pago</TableCell>
              <TableCell>Pedidos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.bills
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((bill: any) => (
                <React.Fragment key={bill.id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleExpand(bill.id)}
                        aria-label={expandedBills.includes(bill.id) ? 'Contraer detalles' : 'Expandir detalles'}
                      >
                        {expandedBills.includes(bill.id) ? (
                          <KeyboardArrowUp />
                        ) : (
                          <KeyboardArrowDown />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      {format(new Date(bill.paidAt || bill.createdAt), 'PPPp', { locale: es })}
                    </TableCell>
                    <TableCell>${bill.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{bill.paymentMethod}</TableCell>
                    <TableCell>{bill.items.length}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                      <Collapse in={expandedBills.includes(bill.id)} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                          <Typography variant="subtitle1" gutterBottom>
                            Detalle de Pedidos
                          </Typography>

                          {bill.items.map((order: any) => (
                            <Box key={order.productId + order.notes} mb={2}>
                              <Typography variant="body2" color="text.secondary">
                                Producto: {order.productName} | Cantidad: {order.quantity} | Precio Unitario: ${order.unitPrice.toFixed(2)} | Notas: {order.notes || '-'}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={history.bills.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
      />
    </Box>
  );
};
