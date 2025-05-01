import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading…' }) => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      transition: 'background 0.2s',
    }}
  >
    <Box textAlign="center">
      <CircularProgress />
      <Typography mt={2}>{message}</Typography>
    </Box>
  </Box>
);

export default LoadingScreen;
