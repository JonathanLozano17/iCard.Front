// src/components/dashboard/SalesReport.tsx
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
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardService } from '../../services/dashboard.service';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const SalesReport = () => {
  const theme = useTheme();
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const data = await DashboardService.getSalesReport(startDate, endDate);
      setReport(data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  const chartData = report?.dailySales.map((day: any) => ({
    date: format(new Date(day.date), 'dd MMM', { locale: es }),
    Ventas: day.sales,
    Pedidos: day.orders,
  }));

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Reporte de Ventas
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="center" mb={3}>
              <Grid item xs={12} sm={5} md={3}>
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
              <Grid item xs={12} sm={5} md={3}>
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
              <Grid item xs={12} sm={2} md={1}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !startDate || !endDate}
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
          ) : report ? (
            <>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary">Ventas Totales</Typography>
                      <Typography variant="h5">
                        ${report.totalSales.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary">Total Pedidos</Typography>
                      <Typography variant="h5">{report.totalOrders}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary">Ticket Promedio</Typography>
                      <Typography variant="h5">
                        ${report.averageOrderValue.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                    <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="Ventas"
                      fill={theme.palette.primary.main}
                      name="Ventas ($)"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="Pedidos"
                      fill={theme.palette.secondary.main}
                      name="Pedidos"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </>
          ) : (
            <Typography>Seleccione un rango de fechas para ver el reporte</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};