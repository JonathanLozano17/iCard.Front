import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container
} from '@mui/material';
import { TableService } from '../../services/tables.service';

export const TableListPublic = () => {
  const [tables, setTables] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await TableService.getAllTables();
        setTables(data);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };
    fetchTables();
  }, []);

  return (
    <Container maxWidth="md" sx={{ p: 2, width: '80vw', height: '100vh'}}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mt: 4 }}>
        Seleccione su Mesa
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {tables.map((table) => (
          <Grid item xs={12} sm={6} md={4} key={table.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Mesa {table.tableNumber}
                </Typography>
                <Typography color="text.secondary">
                  Capacidad: {table.capacity} personas
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/menu/${table.id}`)}
                >
                  Seleccionar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};