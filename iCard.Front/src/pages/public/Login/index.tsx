import { ThemeProviderWrapper } from '../../../components/layout/ThemeProviderWrapper';
import { LoginForm } from './LoginForm';

export const LoginPage = () => {
  return (
    <ThemeProviderWrapper>
      <LoginForm />
    </ThemeProviderWrapper>
  );
};