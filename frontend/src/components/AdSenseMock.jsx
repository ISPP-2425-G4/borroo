import Box from '@mui/material/Box';

const AdSenseMock = () => (
  <Box
    component="a"
    href="https://docs.google.com/forms/d/e/1FAIpQLScH16nWQ5GMiEHtg0b-wjDumEwO9mPerh0VcMoDyHA3BGMhEg/viewform?usp=header"
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      height: '250px',
      margin: '16px 0',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#f9f9f9',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }}
  >
    <img
      src="https://i.ibb.co/k2KLD5GT/image.png"
      alt="¿ME VES? PUBLICÍTATE"
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  </Box>
);

export default AdSenseMock;