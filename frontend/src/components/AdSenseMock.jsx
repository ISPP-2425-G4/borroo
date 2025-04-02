// AdSenseMock.jsx (para desarrollo)
import Box from '@mui/material/Box';

const AdSenseMock = () => (
  <Box 
    sx={{ 
      my: 4, 
      textAlign: 'center',
      height: '250px',  // Altura típica de un banner
      backgroundColor: '#f0f0f0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: '1px dashed #ccc'
    }}
  >
    Espacio para anuncio
  </Box>
);

export default AdSenseMock;