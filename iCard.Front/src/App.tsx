// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProviderWrapper } from './components/layout/ThemeProviderWrapper';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/public/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProductsPage } from './pages/private/Products';
import { CategoriesPage } from './pages/private/Categories';
import { TablesPage } from './pages/private/Tables';
import { DirectAccess } from './pages/public/DirectAccess';
import { TableListPublic } from './pages/public/TableListPublic';
import { MenuPage } from './pages/public/Menu/MenuPage';
import { OrderList } from './components/orders/OrderList';
import { Box } from '@mui/material';
import { DashboardPage } from './pages/private/Dashboard/DashboardPage';
import { TableHistory } from './components/tables/TableHistory';


function App() {
  return (
    <BrowserRouter>
      <ThemeProviderWrapper>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tables"
              element={
                <ProtectedRoute>
                  <TablesPage />
                </ProtectedRoute>
              }
            />
            {/* <Route path="/menu/:tableNumber" element={<DirectAccess />} /> */}
            <Route path="/direct-access" element={<DirectAccess />} />
            <Route path="/table-list" element={<TableListPublic />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/:tableId" element={<MenuPage />} />
            <Route path="/tables/:tableId/orders" element={<OrderList />} />
            {/* <Route path="/tables/:tableId/history" element={<TableHistory />} /> */}

          </Routes>
        </Layout>
      </ThemeProviderWrapper>
    </BrowserRouter>
  );
}

export default App;