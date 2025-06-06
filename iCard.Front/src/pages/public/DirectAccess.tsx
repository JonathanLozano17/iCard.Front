import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Container
} from '@mui/material';
import { TableService } from '../../services/tables.service';

export const DirectAccess = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!tableNumber.trim()) {
      setError('Ingrese un número de mesa');
      return;
    }

    try {
      // Buscar mesa por número
      const tables = await TableService.getAllTables();
      const table = tables.find(t => 
        t.tableNumber.toLowerCase() === tableNumber.toLowerCase()
      );

      if (table) {
        navigate(`/menu/${table.id}`);
      } else {
        setError('Mesa no encontrada');
      }
    } catch (err) {
      setError('Error al buscar la mesa');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Acceso Directo a Mesa
        </Typography>
        
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Número de Mesa"
            variant="outlined"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            error={!!error}
            helperText={error || "Ingrese el número de su mesa"}
            fullWidth
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            fullWidth
          >
            Acceder al Menú
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};