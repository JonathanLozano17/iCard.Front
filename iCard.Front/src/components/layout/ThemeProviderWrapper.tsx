import { ThemeProvider, CssBaseline } from '@mui/material';
import { useThemeStore } from '../../stores/theme.store';
import { lightTheme, darkTheme } from '../../utils/theme';

export const ThemeProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { mode } = useThemeStore();
  
  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};