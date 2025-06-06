// components/layout/Layout.tsx
import { Box } from '@mui/material';
import { Header } from './Header';
import { SideMenu } from './SideMenu';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useState } from 'react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <SideMenu />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          marginTop: '64px' // Adjust based on your AppBar height
        }}
      >
        {children}
      </Box>
    </Box>
  );
};