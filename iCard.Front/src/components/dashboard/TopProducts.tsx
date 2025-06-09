// src/components/dashboard/TopProducts.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DashboardService } from '../../services/dashboard.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const TopProducts = () => {
  const theme = useTheme();
  const [top, setTop] = useState<number>(5);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTopProducts = async () => {
    setLoading(true);
    try {
      const data = await DashboardService.getTopProducts(top, startDate || undefined, endDate || undefined);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTopProducts();
  };

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Productos Más Vendidos
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="center" mb={3}>
              <Grid item xs={12} sm={3} md={2}>
                <TextField
                  label="Top N"
                  type="number"
                  value={top}
                  onChange={(e) => setTop(parseInt(e.target.value) || 5)}
                  inputProps={{ min: 1, max: 20 }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Fecha de inicio"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    maxDate={endDate || undefined}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Fecha de fin"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    minDate={startDate || undefined}
                    maxDate={new Date()}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={1} md={1}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  Filtrar
                </Button>
              </Grid>
            </Grid>
          </form>

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Cantidad Vendida</TableCell>
                    <TableCell align="right">Ingresos Totales</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>{product.categoryName}</TableCell>
                        <TableCell align="right">{product.quantitySold}</TableCell>
                        <TableCell align="right">
                          ${product.totalRevenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No hay datos disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};