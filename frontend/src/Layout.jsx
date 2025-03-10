import Navbar from "./Navbar";
import { Link, Outlet } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

const Layout = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8000/objetos/full", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        if (data.results) {
          setProductos(data.results);
        } else {
          setError("No products found");
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <Navbar />
      <Container maxWidth={false} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", bgcolor: "black", color: "white", padding: 2, mt: "350px" }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "black", flexDirection: "column", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h4">Filtros</Typography>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "black", flexDirection: "row", flexWrap: "wrap", gap: 2, mt: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "black", flexDirection: "column", flexWrap: "wrap", gap: 2 }}>
              <Typography variant="h6">Categoría</Typography>
              <select>
                <option>💻 Tecnología</option>
                <option>⚽ Deporte</option>
                <option>🛠️ Bricolaje</option>
                <option>👕 Ropa</option>
                <option>📦 Mobiliario y Logística</option>
                <option>🎮 Entretenimiento</option>
              </select>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "black", flexDirection: "column", flexWrap: "wrap", gap: 2 }}>
              <div className="search-filters">
                
        <div className="search-container">
          <input 
              type="text" 
              placeholder="Buscar..." 
              className="search" 
              value={searchTerm}
              onChange={handleInputChange} 
            />
          <Link 
            to={`/objetos/search_item/?title=${searchTerm}`} 
            className="search-btn"
          >
            <FiSearch size={20} />
          </Link>
        </div>

      </div>
      </Box> 
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "black", flexDirection: "column", flexWrap: "wrap", gap: 2 }}>
              <Typography variant="h6">Precio</Typography>
              <Box className="price-inputs">
                <input type="number" placeholder="Min" min="0" className="price-input" />
                <span> - </span>
                <input type="number" placeholder="Max" min="0" className="price-input" />
              </Box>
             
              </Box>
              
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "black", flexDirection: "row", flexWrap: "wrap", gap: 2 }}>
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            productos?.map((producto, index) => (
              <Box key={index} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", bgcolor: "white", color: "black", width: "200px", height: "200px", padding: 2, margin: 1, borderRadius: 1 }}>
                <Typography variant="h6">{producto.title}</Typography>
                <Typography variant="body2">{producto.description}</Typography>
                <Typography variant="body2">{producto.category_display}</Typography>
                <Typography variant="body2">{producto.price}€/{producto.price_category_display}</Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>
        <Outlet />
      </Container>
    </div>
  );
};

export default Layout;