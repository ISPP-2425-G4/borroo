import Navbar from "./Navbar";
import {
  Container,
  Box,
  Typography,
  MenuItem,
  Select,
  TextField,
  Card,
  CardContent,
  Slider,
  Tooltip
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const DEFAULT_IMAGE = "../public/default_image.png"; // Reemplaza con la ruta correcta de la imagen por defecto

const Layout = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [precio, setPrecio] = useState([0, 100]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoriaChange = (e) => {
    setCategoria(e.target.value);
  };

  const handleSubcategoriaChange = (e) => {
    setSubcategoria(e.target.value);
  };

  const handlePrecioChange = (event, newValue) => {
    setPrecio(newValue);
  }

  const truncateDescription = (description, length = 100) => {
    if (description.length > length) {
      return description.substring(0, length) + "..."; 
    }
    return description;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/objetos/full`, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        const data = response.data;
        if (data.results) {
          const productosConImagen = await Promise.all(
            data.results.map(async (producto) => {
              const imageUrl = producto.images && producto.images.length > 0
                ? await obtenerImagen(producto.images[0])
                : DEFAULT_IMAGE;
              return { ...producto, imageUrl };
            })
          );
          setProductos(productosConImagen);
        } else {
          setError("No products found");
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProducts();
  }, []);

  const obtenerImagen = async (imgId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/item-images/${imgId}/`
      );
      return response.data.image;
    } catch (error) {
      console.error(`Error al cargar la imagen ${imgId}:`, error);
      return DEFAULT_IMAGE;
    }
  };

  useEffect(() => {
    const filtered = productos.filter((producto) => (
      (categoria === "" || producto.category_display === categoria) &&
      (producto.price >= precio[0] && producto.price <= precio[1]) &&
      (producto.title.toLowerCase().includes(searchTerm.toLowerCase()))
    ));
    setProductosFiltrados(filtered);
  }, [productos, categoria, precio, searchTerm]);

  return (
    <Box sx={{ overflowX: "hidden"}}>
      <Navbar />
      <Container maxWidth={false} sx={{ py: 4, bgcolor:"white", width: "100vw", minHeight: "90vh", justifyContent:"center", alignItems:"center", mt:"48px"}}>
        <Box sx={{display:"flex", flexDirection:"column", alignItems:"center", gap:2}}>
        <Typography variant="h6" align="center" gutterBottom sx={{color:"black"}}>
          Filtros
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection:"row",
            justifyContent: "center",
            gap: 2,
            mb: 4
          }}
        >
          <TextField
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleInputChange}
            variant="outlined"
            sx={{ minWidth: "250px" }}
          />
          <Select
            value={categoria}
            onChange={handleCategoriaChange}
            displayEmpty
            variant="outlined"
            sx={{ minWidth: "250px" }}
          >
            <MenuItem value="">
              <em>Seleccione una categoría</em>
            </MenuItem>
            <MenuItem value="Tecnología">💻 Tecnología</MenuItem>
            <MenuItem value="Deporte">⚽ Deporte</MenuItem>
            <MenuItem value="Bricolaje">🛠️ Bricolaje</MenuItem>
            <MenuItem value="Ropa">👕 Ropa</MenuItem>
            <MenuItem value="Mobiliario y logística">
              📦 Mobiliario y Logística
            </MenuItem>
            <MenuItem value="Entretenimiento">🎮 Entretenimiento</MenuItem>
          </Select>
          {categoria === "Tecnología" && (
          <Select
            value={subcategoria}
            onChange={handleSubcategoriaChange}
            displayEmpty
            variant="outlined"
            sx={{ minWidth: "250px" }}
          >
            <MenuItem value="">
              <em>Seleccione una subcategoría</em>
            </MenuItem>
            <MenuItem value="computers">💻 Ordenadores</MenuItem>
            <MenuItem value="computer_accessories">🖥️ Accesorios de ordenador</MenuItem>
            <MenuItem value="smartphones">📱 Smartphones</MenuItem>
            <MenuItem value="tablets">📱 Tablets</MenuItem>
            <MenuItem value="cameras">📸 Cámaras</MenuItem>
            <MenuItem value="consoles">🎮 Consolas</MenuItem>
            <MenuItem value="tv">📺 Televisores</MenuItem>
            <MenuItem value="monitors">🖥️ Monitores</MenuItem>
            <MenuItem value="smarthome">🏠 Hogar inteligente</MenuItem>
            <MenuItem value="audio">🔊 Audio</MenuItem>
            <MenuItem value="smartwatches">⌚ Smartwatches</MenuItem>
            <MenuItem value="printers_scanners">🖨️ Impresoras y escáneres</MenuItem>
            <MenuItem value="drones">🚁 Drones</MenuItem>
            <MenuItem value="projectors">📽️ Proyectores</MenuItem>
            <MenuItem value="technology__others">🔧 Otros</MenuItem>
          </Select>)}
          {categoria === "Deporte" && (
          <Select
            value={subcategoria}
            onChange={handleSubcategoriaChange}
            displayEmpty
            variant="outlined"
            sx={{ minWidth: "250px"}}
          >
            <MenuItem value="">
              <em>Seleccione una subcategoría</em>
            </MenuItem>
            <MenuItem value="cycling">🚴‍♂️ Ciclismo</MenuItem>
            <MenuItem value="gym">🏋️‍♂️ Gimnasio</MenuItem>
            <MenuItem value="calisthenics">🤸‍♂️ Calistenia</MenuItem>
            <MenuItem value="running">🏃‍♂️ Running</MenuItem>
            <MenuItem value="ball_sports">⚽ Deportes de pelota</MenuItem>
            <MenuItem value="racket_sports">🎾 Deportes de raqueta</MenuItem>
            <MenuItem value="paddle_sports">🛶 Deportes de remo</MenuItem>
            <MenuItem value="martial_arts">🥋 Artes marciales</MenuItem>
            <MenuItem value="snow_sports">🏂 Deportes de nieve</MenuItem>
            <MenuItem value="skateboarding">🛹 Skate</MenuItem>
            <MenuItem value="beach_sports">🏖️ Deportes de playa</MenuItem>
            <MenuItem value="pool_sports">🏊‍♂️ Deportes de piscina</MenuItem>
            <MenuItem value="river_sports">🚣‍♂️ Deportes de río</MenuItem>
            <MenuItem value="mountain_sports">🏞️ Deportes de montaña</MenuItem>
            <MenuItem value="extreme_sports">🏄‍♂️ Deportes extremos</MenuItem>
            <MenuItem value="sports_others">🔧 Otros</MenuItem>
          </Select>
        )}
        {categoria === "Bricolaje" && (
          <Select
            value={subcategoria}
            onChange={handleSubcategoriaChange}
            displayEmpty
            variant="outlined"
            sx={{ minWidth: "250px" }}
          >
            <MenuItem value="">
              <em>Seleccione una subcategoría</em>
            </MenuItem>
            <MenuItem value="electric_tools">🔌 Herramientas eléctricas</MenuItem>
            <MenuItem value="manual_tools">🔧 Herramientas manuales</MenuItem>
            <MenuItem value="machines">🔩 Máquinas</MenuItem>
            <MenuItem value="electricity">⚡ Electricidad</MenuItem>
            <MenuItem value="plumbing">🚰 Fontanería</MenuItem>
            <MenuItem value="woodworking">🪚 Carpintería</MenuItem>
            <MenuItem value="painting">🎨 Pintura</MenuItem>
            <MenuItem value="gardening">🌱 Jardinería</MenuItem>
            <MenuItem value="decoration">🖼️ Decoración</MenuItem>
            <MenuItem value="diy_others">🔧 Otros</MenuItem>
          </Select>
        )}

        {categoria === "Ropa" && (
          <Select
            value={subcategoria}
            onChange={handleSubcategoriaChange}
            displayEmpty
            variant="outlined"
            sx={{ minWidth: "250px" }}
          >
            <MenuItem value="">
              <em>Seleccione una subcategoría</em>
            </MenuItem>
            <MenuItem value="summer_clothing">🌞 Ropa de verano</MenuItem>
            <MenuItem value="winter_clothing">❄️ Ropa de invierno</MenuItem>
            <MenuItem value="mevent_clothing">🎩 Ropa de evento para hombre</MenuItem>
            <MenuItem value="wevent_clothing">👗 Ropa de evento para mujer</MenuItem>
            <MenuItem value="sport_event_apparel">⚽ Ropa de evento deportivo</MenuItem>
            <MenuItem value="mshoes">👟 Zapatos para hombre</MenuItem>
            <MenuItem value="wshoes">👠 Zapatos para mujer</MenuItem>
            <MenuItem value="suits">👔 Trajes</MenuItem>
            <MenuItem value="dresses">👗 Vestidos</MenuItem>
            <MenuItem value="jewelry">💍 Joyería</MenuItem>
            <MenuItem value="watches">⌚ Relojes</MenuItem>
            <MenuItem value="bags">👜 Bolsos</MenuItem>
            <MenuItem value="sunglasses">🕶️ Gafas de sol</MenuItem>
            <MenuItem value="hats">👒 Sombreros</MenuItem>
            <MenuItem value="clothing_others">🔧 Otros</MenuItem>
          </Select>
        )}

        {categoria === "Mobiliario y logística" && (
          <Select
            value={subcategoria}
            onChange={handleSubcategoriaChange}
            displayEmpty
            variant="outlined"
            sx={{ minWidth: "250px" }}
          >
            <MenuItem value="">
              <em>Seleccione una subcategoría</em>
            </MenuItem>
            <MenuItem value="home_furniture">🛋️ Muebles de hogar</MenuItem>
            <MenuItem value="home_appliances">🏠 Electrodomésticos</MenuItem>
            <MenuItem value="event_equipment">🎪 Equipamiento para eventos</MenuItem>
            <MenuItem value="kids_furniture">🛏️ Muebles para niños</MenuItem>
            <MenuItem value="office_furniture">💼 Muebles de oficina</MenuItem>
            <MenuItem value="kitchen">🍽️ Cocina</MenuItem>
            <MenuItem value="bathroom">🚿 Baño</MenuItem>
            <MenuItem value="garden_furniture">🌳 Muebles de jardín</MenuItem>
            <MenuItem value="decoration_ambience">🕯️ Decoración y ambiente</MenuItem>
            <MenuItem value="furniture_and_logistics_others">🔧 Otros</MenuItem>
          </Select>
        )}

        {categoria === "Entretenimiento" && (
          <Select
            value={subcategoria}
            onChange={handleSubcategoriaChange}
            displayEmpty
            variant="outlined"
            sx={{ minWidth: "250px" }}
          >
            <MenuItem value="">
              <em>Seleccione una subcategoría</em>
            </MenuItem>
            <MenuItem value="videogames">🎮 Videojuegos</MenuItem>
            <MenuItem value="board_games">🎲 Juegos de mesa</MenuItem>
            <MenuItem value="books">📚 Libros</MenuItem>
            <MenuItem value="movies">🎬 Películas</MenuItem>
            <MenuItem value="music">🎶 Música</MenuItem>
            <MenuItem value="instruments">🎸 Instrumentos</MenuItem>
            <MenuItem value="party">🎉 Fiesta</MenuItem>
            <MenuItem value="camping">🏕️ Camping</MenuItem>
            <MenuItem value="travel">✈️ Viaje</MenuItem>
            <MenuItem value="other_entertainment">🔧 Otros</MenuItem>
          </Select>
          )}

          <Box sx={{ display: "flex", alignItems: "center", flexDirection:"column" }}>
            <Typography variant="body1" sx={{ mr: 2, color:"black" }}> Precio: </Typography>
          <Slider
            value={precio}
            onChange={handlePrecioChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}€`}
            min={0}
            max={100}
            step={5}
            sx={{ minWidth: "250px" }}
          />
          </Box>
          
        </Box>
        {error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 2,
              width: "100%"
            }}
          >
            {productosFiltrados?.map((producto, index) => (
              <Box
                key={index}
                sx={{
                  flex: "1 1 200px",
                  maxWidth: "250px",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <Link to={`/show-item/${producto.id}`}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <img src={producto.imageUrl} alt="Imagen del producto" style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      backgroundColor: "#D8D8D8",
                      color: "black",
                      p: 2,
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {producto.title}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {producto.category_display}
                    </Typography>
                    <Typography variant="body2">
                      {producto.price}€ / {producto.price_category_display}
                    </Typography>
                    <Tooltip
                      title={producto.description}
                      arrow
                    >
                      <Typography variant="body2" gutterBottom>
                        {truncateDescription(producto.description, 100)}
                      </Typography>
                    </Tooltip>
                  </CardContent>
                </Card>
                </Link>
              </Box>
            ))}
          </Box>
        )}
        </Box>
      </Container>
    </Box>
  );
};

export default Layout;