import { useEffect } from "react";
import Box from '@mui/material/Box';

const AdSenseComponent = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Error al cargar AdSense:', error);
    }
  }, []);

  return (
    <Box sx={{ my: 4, textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7688849606033983"
        data-ad-slot="4350441994"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      {/* Añadir script de inicialización directamente */}
      <script dangerouslySetInnerHTML={{
        __html: `(adsbygoogle = window.adsbygoogle || []).push({});`
      }} />
    </Box>
  );
};

export default AdSenseComponent;