import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Download, Close } from '@mui/icons-material';
import { TableService } from '../../services/tables.service';

interface QRCodeGeneratorProps {
  tableId: number;
  tableNumber: string;
  open: boolean;
  onClose: () => void;
}

export const QRCodeGenerator = ({ tableId, tableNumber, open, onClose }: QRCodeGeneratorProps) => {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchQrCode();
    }
  }, [open, tableId]);

  const fetchQrCode = async () => {
    setLoading(true);
    try {
      const base64Image = await TableService.getQrCodeBase64(tableId);
      setQrCodeImage(base64Image);
    } catch (error) {
      console.error('Error fetching QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrCodeImage) {
      const link = document.createElement('a');
      link.href = qrCodeImage;
      link.download = `QR-Mesa-${tableNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Código QR para Mesa {tableNumber}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
          {loading ? (
            <CircularProgress />
          ) : qrCodeImage ? (
            <>
              <img 
                src={qrCodeImage} 
                alt={`QR Code Mesa ${tableNumber}`} 
                style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
              />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Escanee este código para acceder al menú de la mesa
              </Typography>
            </>
          ) : (
            <Typography>No se pudo generar el código QR</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          startIcon={<Download />}
          onClick={handleDownload}
          disabled={!qrCodeImage}
          variant="contained"
        >
          Descargar QR
        </Button>
      </DialogActions>
    </Dialog>
  );
};