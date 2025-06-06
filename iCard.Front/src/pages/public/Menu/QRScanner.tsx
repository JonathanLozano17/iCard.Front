import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, TextField } from '@mui/material';
import QrScanner from 'qr-scanner';
import { TableService } from '../../../services/tables.service';

interface QRScannerProps {
  onTableDetected: (tableId: number) => void;
}

export const QRScanner = ({ onTableDetected }: QRScannerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [manualTableNumber, setManualTableNumber] = useState('');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scannerRef = React.useRef<QrScanner | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      async (result) => {
        try {
          setLoading(true);
          const segments = result.data.split('/');
          const tableId = parseInt(segments[segments.length - 1]);

          if (isNaN(tableId)) {
            throw new Error('Código QR no válido');
          }

          const table = await TableService.getTableByQrCode(result.data);
          onTableDetected(table.id);
          navigate(`/menu/${table.id}`);
        } catch (err) {
          setError('Mesa no encontrada. Escanee un código QR válido.');
          console.error('Error scanning QR:', err);
        } finally {
          setLoading(false);
        }
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scannerRef.current = qrScanner;

    const checkPermissions = async () => {
      try {
        const cameras = await QrScanner.listCameras();
        if (cameras.length > 0) {
          await qrScanner.start();
          setHasPermission(true);
        } else {
          setHasPermission(false);
          setError('No se encontró una cámara disponible');
        }
      } catch (err) {
        setHasPermission(false);
        setError('Se necesitan permisos para acceder a la cámara');
        console.error('Camera permission error:', err);
      }
    };

    checkPermissions();

    return () => {
      qrScanner.destroy();
    };
  }, [navigate, onTableDetected]);

  const handleManualAccess = () => {
    const tableId = parseInt(manualTableNumber);
    if (!isNaN(tableId)) {
      navigate(`/menu/${tableId}`);
    } else {
      setError('Ingrese un número de mesa válido');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      p: 3,
      height: '100%',
    }}>
      <Typography variant="h5" gutterBottom>
        Escanear Código QR
      </Typography>

      <Typography variant="body1" gutterBottom>
        O ingrese el número de mesa manualmente:
      </Typography>

      <TextField
        label="Número de Mesa"
        variant="outlined"
        sx={{ mb: 2, width: '100%', maxWidth: '300px' }}
        value={manualTableNumber}
        onChange={(e) => setManualTableNumber(e.target.value)}
      />

      <Button 
        variant="contained" 
        onClick={handleManualAccess}
        sx={{ mb: 4 }}
      >
        Acceder Manualmente
      </Button>

      {hasPermission === false && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error || 'No se pudo acceder a la cámara'}
        </Typography>
      )}

      <Box sx={{ 
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        height: '300px',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        mb: 2
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%'
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: hasPermission ? 'block' : 'none'
            }}
          />
        )}

        {hasPermission && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '40px solid',
            borderColor: 'rgba(0, 0, 0, 0.3)',
            pointerEvents: 'none'
          }} />
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};
