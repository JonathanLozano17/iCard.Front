// src/components/dashboard/DashboardSummary.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  AttachMoney,
  ShoppingCart,
  HourglassEmpty,
  TableRestaurant,
  TrendingUp,
  MonetizationOn,
} from '@mui/icons-material';
import { DashboardService } from '../../services/dashboard.service';

export const DashboardSummary = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await DashboardService.getSummary();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!summary) {
    return <Typography>No se pudo cargar el resumen del dashboard</Typography>;
  }

  const cards = [
    {
      title: 'Ventas Hoy',
      value: `$${summary.todaySales.toFixed(2)}`,
      icon: <AttachMoney fontSize="large" />,
      color: theme.palette.success.main,
    },
    {
      title: 'Pedidos Hoy',
      value: summary.todayOrders,
      icon: <ShoppingCart fontSize="large" />,
      color: theme.palette.info.main,
    },
    {
      title: 'Pedidos Pendientes',
      value: summary.pendingOrders,
      icon: <HourglassEmpty fontSize="large" />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Mesas Activas',
      value: summary.activeTables,
      icon: <TableRestaurant fontSize="large" />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Ventas Mensuales',
      value: `$${summary.monthlySales.toFixed(2)}`,
      icon: <MonetizationOn fontSize="large" />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Crecimiento Semanal',
      value: `${summary.weeklySalesGrowth.toFixed(2)}%`,
      icon: <TrendingUp fontSize="large" />,
      color: summary.weeklySalesGrowth >= 0 ? theme.palette.success.main : theme.palette.error.main,
    },
  ];

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Resumen General
      </Typography>
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography
                      variant="h6"
                      color="textSecondary"
                      gutterBottom
                    >
                      {card.title}
                    </Typography>
                    <Typography variant="h4" color="textPrimary">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};