import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { CategoryService } from '../../services/categories.service';

type CategoryFormProps = {
  open: boolean;
  onClose: () => void;
  category: any | null;
};

export const CategoryForm = ({ open, onClose, category }: CategoryFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');

      // Si la imagen viene en bytes o base64, crear URL para mostrar:
      if (category.imageBytes) {
        const blob = new Blob([new Uint8Array(category.imageBytes)], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setPreviewImage(url);
      } else if (category.imageBase64) {
        setPreviewImage(`data:image/jpeg;base64,${category.imageBase64}`);
      } else if (category.imageUrl) {
        // Por si hay una URL ya en el backend
        setPreviewImage(category.imageUrl);
      } else {
        setPreviewImage(null);
      }

      setImageFile(null); // limpiar archivo
    } else {
      resetForm();
    }
  }, [category]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPreviewImage(null);
    setImageFile(null);
    setErrors({});
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para convertir archivo a base64 sin prefijo
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'El nombre es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let imageBase64: string | undefined = undefined;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      const categoryData = {
        name,
        description,
        imageBase64, // enviamos base64, no URL
      };

      if (category) {
        await CategoryService.updateCategory(category.id, categoryData);
      } else {
        await CategoryService.createCategory(categoryData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {category ? 'Editar Categoría' : 'Crear Nueva Categoría'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={previewImage || undefined}
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
              Formatos soportados: JPG, PNG, GIF
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {category ? 'Guardar Cambios' : 'Crear Categoría'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
