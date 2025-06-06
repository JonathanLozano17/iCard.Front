import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { CategoryService } from '../../services/categories.service';
import { useAuthStore } from '../../stores/auth.store';
import { CategoryForm } from './CategoryForm';

type Category = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdBy: string;
};

export const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = user?.role === 'Admin' 
        ? await CategoryService.getAllCategories() 
        : await CategoryService.getActiveCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredCategories = categories.filter((category) => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenForm = (category: Category | null) => {
    setSelectedCategory(category);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await CategoryService.toggleCategoryStatus(id);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Gestión de Categorías</Typography>
        {user?.role === 'Admin' && (
          <Tooltip title="Agregar nueva categoría">
            <IconButton color="primary" onClick={() => handleOpenForm(null)}>
              <Add /> Nueva Categoría
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Buscar categorías"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Avatar 
                      src={category.imageUrl} 
                      variant="rounded"
                      sx={{ width: 56, height: 56 }}
                    />
                  </TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={category.isActive ? 'Activa' : 'Inactiva'}
                      color={category.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleOpenForm(category)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user?.role === 'Admin' && (
                        <>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenForm(category)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={category.isActive ? 'Desactivar' : 'Activar'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(category.id)}
                              color={category.isActive ? 'error' : 'success'}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredCategories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Categorías por página:"
      />

      <CategoryForm
        open={openForm}
        onClose={handleCloseForm}
        category={selectedCategory}
      />
    </Box>
  );
};