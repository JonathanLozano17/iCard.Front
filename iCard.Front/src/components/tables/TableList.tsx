import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, TextField, IconButton, Tooltip, Box, Typography, Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Edit, Add, CheckCircle, Cancel, History } from '@mui/icons-material'; // Importé History aquí
import { TableService } from '../../services/tables.service';
import { useAuthStore } from '../../stores/auth.store';
import { TableForm } from './TableForm';
import { TableHistory } from './TableHistory';

type Table = {
  id: number;
  tableNumber: string;
  description: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
};

export const TableList = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const data = await TableService.getAllTables();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredTables = tables.filter((table) =>
    table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (table.description && table.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenForm = (table: Table | null) => {
    setSelectedTable(table);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedTable(null);
    fetchTables();
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await TableService.toggleTableStatus(id);
      fetchTables();
    } catch (error) {
      console.error('Error toggling table status:', error);
    }
  };

  const handleOpenHistory = (tableId: number) => {
    setSelectedTableId(tableId);
    setOpenHistory(true);
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
    setSelectedTableId(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Lista de Mesas</Typography>
        <TextField
          label="Buscar"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
        />
        {user?.role === 'Admin' && (
          <Button startIcon={<Add />} variant="contained" onClick={() => handleOpenForm(null)}>
            Nueva Mesa
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Capacidad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha creación</TableCell>
              <TableCell>Acciones</TableCell>
              <TableCell>Historial</TableCell> {/* nueva columna */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTables.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((table) => (
              <TableRow key={table.id} hover>
                <TableCell>{table.tableNumber}</TableCell>
                <TableCell>{table.description}</TableCell>
                <TableCell>{table.capacity}</TableCell>
                <TableCell>{table.isActive ? 'Activo' : 'Inactivo'}</TableCell>
                <TableCell>{new Date(table.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenForm(table)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={table.isActive ? 'Desactivar' : 'Activar'}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(table.id)}
                        color={table.isActive ? 'error' : 'success'}
                      >
                        {table.isActive ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver Historial">
                    <IconButton size="small" onClick={() => handleOpenHistory(table.id)}>
                      <History fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredTables.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Mesas por página:"
      />

      <TableForm
        open={openForm}
        onClose={handleCloseForm}
        table={selectedTable}
      />

      <Dialog open={openHistory} onClose={handleCloseHistory} maxWidth="lg" fullWidth>
        <DialogTitle>Historial de Mesa</DialogTitle>
        <DialogContent dividers>
          {selectedTableId && <TableHistory tableId={selectedTableId} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistory}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
