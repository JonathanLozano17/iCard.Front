import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { 
  Edit, 
  Add, 
  QrCode,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { TableService } from '../../services/tables.service';
import { useAuthStore } from '../../stores/auth.store';
import { TableForm } from './TableForm';
import { QRCodeGenerator } from './QRCodeGenerator';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { MeetingRoom } from '@mui/icons-material'; 
import { FreeTableDialog } from '../orders/FreeTableDialog'; 


type Table = {
  id: number;
  tableNumber: string;
  description: string;
  capacity: number;
  qrCodeContent: string;
  isActive: boolean;
  createdAt: string;
};

export const TableList = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [refresh, setRefresh] = useState(false);

  const [tables, setTables] = useState<Table[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [freeDialogOpen, setFreeDialogOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (location.state?.tableFreed) {
      fetchTables();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  const fetchTables = async () => {
    try {
      const data = await TableService.getAllTables();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
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

  const filteredTables = tables.filter((table) => {
    return table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (table.description && table.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleOpenForm = (table: Table | null) => {
    setSelectedTable(table);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedTable(null);
    fetchTables();
  };

  const handleOpenQrDialog = (table: Table) => {
    setSelectedTable(table);
    setOpenQrDialog(true);
  };

  const handleCloseQrDialog = () => {
    setOpenQrDialog(false);
    setSelectedTable(null);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await TableService.toggleTableStatus(id);
      fetchTables();
    } catch (error) {
      console.error('Error toggling table status:', error);
    }
  };

  const handleSelectTable = (tableId: number) => {
    navigate(`/menu/${tableId}`);
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
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => handleOpenForm(null)}
          >
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
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTables
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((table) => (
                <TableRow
                  key={table.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSelectTable(table.id)}
                >
                  <TableCell>{table.tableNumber}</TableCell>
                  <TableCell>{table.description || '-'}</TableCell>
                  <TableCell>{table.capacity}</TableCell>
                  <TableCell>
                    <Chip
                      label={table.isActive ? 'Activa' : 'Inactiva'}
                      color={table.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(table.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver QR">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenQrDialog(table)}
                        >
                          <QrCode fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {user?.role === 'Admin' && (
                        <>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenForm(table)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={table.isActive ? 'Desactivar' : 'Activar'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(table.id)}
                              color={table.isActive ? 'error' : 'success'}
                            >
                              {table.isActive ? (
                                <Cancel fontSize="small" />
                              ) : (
                                <CheckCircle fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Liberar mesa">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedTable(table);
                                setFreeDialogOpen(true);
                              }}
                            >
                              <MeetingRoom fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
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

      {selectedTable && (
        <QRCodeGenerator
          tableId={selectedTable.id}
          tableNumber={selectedTable.tableNumber}
          open={openQrDialog}
          onClose={handleCloseQrDialog}
        />
      )}

      <FreeTableDialog
        open={freeDialogOpen}
        tableId={selectedTable?.id || 0}
        onClose={() => setFreeDialogOpen(false)}
        onSuccess={fetchTables}
      />
    </Box>
  );
};
