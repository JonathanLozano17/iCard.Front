// ProductForm.tsx - Componente actualizado
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  InputLabel,
  FormControl,
  Select,
  Typography,
  Avatar,
  Box,
} from '@mui/material';
import { ProductService } from '../../services/products.service';
import { CategoryService } from '../../services/categories.service';

type ProductFormProps = {
  open: boolean;
  onClose: () => void;
  product: any | null;
};

export const ProductForm = ({ open, onClose, product }: ProductFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('0');
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setCategoryId(product.categoryId.toString());
      setStock(product.stock.toString());
      
      // Convertir bytes a imagen para mostrar
      if (product.imageBytes) {
        const blob = new Blob([new Uint8Array(product.imageBytes)], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setImage(url);
      }
    } else {
      resetForm();
    }
  }, [product]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CategoryService.getActiveCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setStock('0');
    setImage(null);
    setImageFile(null);
    setErrors({});
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'El nombre es requerido';
    if (!price.trim()) newErrors.price = 'El precio es requerido';
    if (isNaN(Number(price))) newErrors.price = 'El precio debe ser un número';
    if (!categoryId) newErrors.category = 'La categoría es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // NUEVA FUNCIÓN: Convierte archivo a Base64 (sin el prefijo data:)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          // Remover el prefijo "data:image/...;base64," para obtener solo el Base64
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const productData = {
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        initialStock: parseInt(stock),
        // CAMBIO IMPORTANTE: Ahora enviamos imageBase64 en lugar de imageBytes
        imageBase64: imageFile ? await fileToBase64(imageFile) : undefined,
      };

      console.log('Enviando producto:', productData);

      if (product) {
        await ProductService.updateProduct(product.id, productData);
      } else {
        await ProductService.createProduct(productData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nombre"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mt: 2 }}
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  label="Precio"
                  fullWidth
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  error={!!errors.price}
                  helperText={errors.price}
                  required
                  InputProps={{
                    startAdornment: '$',
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                {!product && (
                  <TextField
                    label="Stock Inicial"
                    fullWidth
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                )}
              </Grid>
            </Grid>
            
            <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.category}>
              <InputLabel id="category-label">Categoría *</InputLabel>
              <Select
                labelId="category-label"
                value={categoryId}
                label="Categoría"
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error">
                  {errors.category}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={image || undefined}
                variant="rounded"
                sx={{ width: 200, height: 200, mb: 2 }}
              />
              <Button variant="contained" component="label">
                Subir Imagen
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              <Typography variant="caption" sx={{ mt: 1 }}>
                Formatos soportados: JPG, PNG
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {product ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};