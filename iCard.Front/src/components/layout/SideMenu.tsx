// components/layout/SideMenu.tsx
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  ShoppingBasket as ProductsIcon,
  Category as CategoriesIcon,
  TableRestaurant as TablesIcon,
  MenuBook as MenuIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useThemeStore } from '../../stores/theme.store';

export const SideMenu = () => {
  const { mode } = useThemeStore();
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: mode === 'dark' ? 'background.default' : 'background.paper',
        },
      }}
    >
      <Toolbar /> {/* This creates space below the AppBar */}
      <Divider />
      <List>
        {/* Private Routes */}
        <ListItem component={Link} to="/dashboard">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem component={Link} to="/products">
          <ListItemIcon><ProductsIcon /></ListItemIcon>
          <ListItemText primary="Products" />
        </ListItem>
        
        <ListItem component={Link} to="/categories">
          <ListItemIcon><CategoriesIcon /></ListItemIcon>
          <ListItemText primary="Categories" />
        </ListItem>
        
        <ListItem component={Link} to="/tables">
          <ListItemIcon><TablesIcon /></ListItemIcon>
          <ListItemText primary="Tables" />
        </ListItem>
        
        <Divider />
        
        {/* Public Routes */}
        <ListItem component={Link} to="/menu">
          <ListItemIcon><MenuIcon /></ListItemIcon>
          <ListItemText primary="Public Menu" />
        </ListItem>
        
        <ListItem component={Link} to="/table-list">
          <ListItemIcon><TablesIcon /></ListItemIcon>
          <ListItemText primary="Table List" />
        </ListItem>
        
        <ListItem component={Link} to="/login">
          <ListItemIcon><LoginIcon /></ListItemIcon>
          <ListItemText primary="Login" />
        </ListItem>
      </List>
    </Drawer>
  );
};