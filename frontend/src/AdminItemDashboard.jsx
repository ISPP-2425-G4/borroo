import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/system";
import { FiImage } from "react-icons/fi";
import EditIcon from '@mui/icons-material/Edit';

const ImageUploadText = styled(Typography)(() => ({
    marginTop: "8px",
    color: "#666",
    fontSize: "0.9rem",
  }));

  const HiddenFileInput = styled("input")({
    display: "none",
  });

const FileInputContainer = styled(Box)(() => ({
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px dashed #ddd",
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "1.5rem",
    "&:hover": {
      borderColor: "#4a90e2",
      backgroundColor: "#f0f7ff",
    },
  }));

const categoryList = [
    { value: 'technology', label: 'Tecnología' },
    { value: 'sports', label: 'Deporte' },
    { value: 'diy', label: 'Bricolaje' },
    { value: 'clothing', label: 'Ropa' },
    { value: 'furniture_and_logistics', label: 'Mobiliario y logística' },
    { value: 'entertainment', label: 'Entretenimiento' }
];

const categoryOptions = {
    technology: [
        { value: 'computers', label: 'Ordenadores' },
        { value: 'computer_accessories', label: 'Accesorios de ordenador' },
        { value: 'smartphones', label: 'Smartphones' },
        { value: 'tablets', label: 'Tablets' },
        { value: 'cameras', label: 'Cámaras' },
        { value: 'consoles', label: 'Consolas' },
        { value: 'tv', label: 'Televisores' },
        { value: 'monitors', label: 'Monitores' },
        { value: 'smarthome', label: 'Hogar inteligente' },
        { value: 'audio', label: 'Audio' },
        { value: 'smartwatchs', label: 'Smartwatches' },
        { value: 'printers_scanners', label: 'Impresoras y escáneres' },
        { value: 'drones', label: 'Drones' },
        { value: 'projectors', label: 'Proyectores' },
        { value: 'technology__others', label: 'Otros (Tecnología)' },
    ],
    sports: [
        { value: 'cycling', label: 'Ciclismo' },
        { value: 'gym', label: 'Gimnasio' },
        { value: 'calisthenics', label: 'Calistenia' },
        { value: 'running', label: 'Running' },
        { value: 'ball_sports', label: 'Deportes de pelota' },
        { value: 'racket_sports', label: 'Deportes de raqueta' },
        { value: 'paddle_sports', label: 'Deportes de remo' },
        { value: 'martial_arts', label: 'Artes marciales' },
        { value: 'snow_sports', label: 'Deportes de nieve' },
        { value: 'skateboarding', label: 'Skate' },
        { value: 'beach_sports', label: 'Deportes de playa' },
        { value: 'pool_sports', label: 'Deportes de piscina' },
        { value: 'river_sports', label: 'Deportes de río' },
        { value: 'mountain_sports', label: 'Deportes de montaña' },
        { value: 'extreme_sports', label: 'Deportes extremos' },
        { value: 'sports_others', label: 'Otros (Deporte)' },
    ],
    diy: [
        { value: 'electric_tools', label: 'Herramientas eléctricas' },
        { value: 'manual_tools', label: 'Herramientas manuales' },
        { value: 'machines', label: 'Máquinas' },
        { value: 'electricity', label: 'Electricidad' },
        { value: 'plumbing', label: 'Fontanería' },
        { value: 'woodworking', label: 'Carpintería' },
        { value: 'painting', label: 'Pintura' },
        { value: 'gardening', label: 'Jardinería' },
        { value: 'decoration', label: 'Decoración' },
        { value: 'diy_others', label: 'Otros (Bricolaje)' },
    ],
    clothing: [
        { value: 'summer_clothing', label: 'Ropa de verano' },
        { value: 'winter_clothing', label: 'Ropa de invierno' },
        { value: 'mevent_clothing', label: 'Ropa de evento para hombre' },
        { value: 'wevent_clothing', label: 'Ropa de evento para mujer' },
        { value: 'sport_event_apparel', label: 'Ropa de evento deportivo' },
        { value: 'mshoes', label: 'Zapatos para hombre' },
        { value: 'wshoes', label: 'Zapatos para mujer' },
        { value: 'suits', label: 'Trajes' },
        { value: 'dresses', label: 'Vestidos' },
        { value: 'jewelry', label: 'Joyería' },
        { value: 'watches', label: 'Relojes' },
        { value: 'bags', label: 'Bolsos' },
        { value: 'sunglasses', label: 'Gafas de sol' },
        { value: 'hats', label: 'Sombreros' },
        { value: 'clothing_others', label: 'Otros (Ropa)' },
    ],
    furniture_and_logistics: [
        { value: 'home_furniture', label: 'Muebles de hogar' },
        { value: 'home_appliances', label: 'Electrodomésticos' },
        { value: 'event_equipment', label: 'Equipamiento para eventos' },
        { value: 'kids_furniture', label: 'Muebles para niños' },
        { value: 'office_furniture', label: 'Muebles de oficina' },
        { value: 'kitchen', label: 'Cocina' },
        { value: 'bathroom', label: 'Baño' },
        { value: 'garden_furniture', label: 'Muebles de jardín' },
        { value: 'decoration_ambience', label: 'Decoración y ambiente' },
        { value: 'furniture_and_logistics_others', label: 'Otros (Mobiliario y logística)' },
    ],
    entertainment: [
        { value: 'videogames', label: 'Videojuegos' },
        { value: 'board_games', label: 'Juegos de mesa' },
        { value: 'books', label: 'Libros' },
        { value: 'movies', label: 'Películas' },
        { value: 'music', label: 'Música' },
        { value: 'instruments', label: 'Instrumentos' },
        { value: 'party', label: 'Fiesta' },
        { value: 'camping', label: 'Camping' },
        { value: 'travel', label: 'Viaje' },
        { value: 'other_entertainment', label: 'Otros (Entretenimiento)' },
    ],
    none: [
        { value: 'none', label: 'Ninguno' },
    ],
};

const ImageGallery = styled(Box)(() => ({
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginTop: "16px",
    marginBottom: "24px",
  }));
  

  const ImageContainer = styled(Box)(() => ({
    position: "relative",
    width: "150px",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  }));

  const PreviewImage = styled("img")(() => ({
    width: "100%",
    height: "120px",
    objectFit: "cover",
  }));


const AdminItemDashboard = () => {
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          setImages((prevImages) => [...prevImages, ...files]);
          
        }
    };
    const [items, setItems] = useState([]);
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/items/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(response.data);
        } catch (error) {
            alert("Error al obtener ítems.", error);
        }
    };

    const handleDeleteItem = async (itemId) => {
        const confirm = window.confirm("¿Eliminar este ítem?");
        if (!confirm) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/item/${itemId}/delete/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchItems();
        } catch (error) {
            alert("Error al eliminar ítem.", error);
        }
    };
   
    const handleEditItem = async (itemId) => {
        const formData = new FormData();
    
        
        formData.append("title", editItemData.title);
        formData.append("description", editItemData.description);
        formData.append("category", editItemData.category);
        formData.append("subcategory", editItemData.subcategory);
        formData.append("cancel_type", editItemData.cancel_type);
        formData.append("price_category", editItemData.price_category);
        formData.append("price", editItemData.price);
        formData.append("deposit", editItemData.deposit);
    
        images.forEach((image) => {
            formData.append("image_files", image);
        });
    
        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/item/${itemId}/update/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            alert("Ítem editado correctamente.");
            setEditItemData(null);
            fetchItems();
        } catch (error) {
            alert("Error al editar ítem.");
            console.error(error.response?.data || error);
        }
    };
    
    
    
    const [images, setImages] = useState([]);
   
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        subcategory: "",
        cancel_type: "",
        price_category: "",
        price: "",
        deposit: "",
        
    });
   
    const [editItemData, setEditItemData] = useState(null)
    const [showCreateForm, setShowCreateForm] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleCategoryChange = (event) => {
        const newCategory = event.target.value;
        setFormData({ ...formData, category: newCategory, subcategory: "" });
    };
    const triggerFileSelect = () => {
        document.getElementById('image-upload').click();
      };
    

    const handleCreateItem = async () => {
        const form = new FormData();
        
        form.append("title", formData.title);
        form.append("description", formData.description);
        form.append("price", formData.price);
        form.append("price_category", formData.price_category);
        form.append("category", formData.category);
        form.append("subcategory", formData.subcategory);
        form.append("cancel_type", formData.cancel_type || "flexible");
        form.append("deposit", formData.deposit);
        form.append("draft_mode", false);
        form.append("featured", false); 
        
         
       
        images.forEach((image) => {
            form.append("image_files", image);
        });
    
        try {
           
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/item/create/`,
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data", 
                    },
                }
            );
            alert("Ítem creado correctamente.");
            setShowCreateForm(false);
            setFormData({
                title: "",
                description: "",
                price: "",
                price_category: "",
                category: "none",
                subcategory: "",
                cancel_type: "",
                deposit: "",
            });
            fetchItems(); 
        } catch (error) {
            alert("Error al crear ítem.");
            console.error(error);
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
            <Box sx={{textAlign: "center", mb: 2 }}>
                
                <Button
                    variant="contained"
                    onClick={() => setShowCreateForm(true)} 
                >
                    Crear Ítem
                </Button>
            </Box>
    
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                        <TableRow>
                            <TableCell><strong>Título</strong></TableCell>
                            <TableCell><strong>Descripción</strong></TableCell>
                            <TableCell><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.title}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleDeleteItem(item.id)}>
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                    <IconButton onClick={() => {
                                        setEditItemData(item)
                                        setFormData(item)
                                    }}>
                                        <EditIcon color="primary" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
       
            
            <Dialog open={editItemData} onClose={() => setEditItemData(null)}>
    <DialogTitle>Editar Ítem</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Título"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Precio"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                          <TextField
                            fullWidth
                            label="Fianza"
                            name="deposit"
                            value={formData.deposit}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Precio Categoría</InputLabel>
                            <Select
                                name="price_category"
                                value={formData.price_category}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="hour">Hora</MenuItem>
                                <MenuItem value="day">Día</MenuItem>
                                <MenuItem value="month">Mes</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Categoría</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                onChange={handleCategoryChange}
                            >
                                <MenuItem value="none" disabled>Selecciona una categoría</MenuItem>
                                {categoryList.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {formData.category !== "none" && (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Subcategoría</InputLabel>
                                <Select
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleInputChange}
                                    label="Subcategoría"
                                >
                                    {categoryOptions[formData.category]?.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <FileInputContainer onClick={triggerFileSelect}>
                            <FiImage size={32} color="#4a90e2" />
                            <ImageUploadText>
                                Haz clic para seleccionar imágenes
                            </ImageUploadText>
                            <ImageUploadText variant="caption">
                                (Para seleccionar múltiples archivos, mantén presionada la tecla Ctrl o Cmd)
                            </ImageUploadText>
                            <HiddenFileInput
                                id="image-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </FileInputContainer>
                        
                        {images.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#555" }}>
                                    Imágenes seleccionadas ({images.length})
                                  </Typography>
                                  <ImageGallery>
                                    {images.map((image, index) => (
                                      <ImageContainer key={index}>
                                        <PreviewImage src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                                        {/* <RemoveButton onClick={() => handleRemoveImage(index)}>
                                          <FiTrash2 size={16} />
                                        </RemoveButton> */}
                                      </ImageContainer>
                                    ))}
                                  </ImageGallery>
                                </Box>
                              )}
                

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditItemData(null)} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={() => handleEditItem(editItemData.id)} color="primary">
                                    Guardar
                            </Button>
                    </DialogActions>
                </Dialog>
      
         <Dialog open={showCreateForm} onClose={() => setShowCreateForm(false)}>
                    <DialogTitle>Crear Ítem</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Título"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Precio"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                         <TextField
                            fullWidth
                            label="Fianza"
                            name="deposit"
                            value={formData.deposit}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Precio Categoría</InputLabel>
                            <Select
                                name="price_category"
                                value={formData.price_category}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="hour">Hora</MenuItem>
                                <MenuItem value="day">Dia</MenuItem>
                                <MenuItem value="month">Mes</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                        <InputLabel>Categoría</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleCategoryChange}
                                >
                                    <MenuItem value="none" disabled>Selecciona una categoría</MenuItem> 
                                    {categoryList.map((cat) => (
                                        <MenuItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                        </FormControl>

                        {formData.category !== "none" && (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Subcategoría</InputLabel>
                                <Select
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleInputChange}
                                    label="Subcategoría"
                                >
                                    {categoryOptions[formData.category]?.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        <FileInputContainer onClick={triggerFileSelect}>
                                        <FiImage size={32} color="#4a90e2" />
                                        <ImageUploadText>
                                            Haz clic para seleccionar imágenes
                                        </ImageUploadText>
                                        <ImageUploadText variant="caption">
                                            (Para seleccionar múltiples archivos, mantén presionada la tecla Ctrl o Cmd)
                                        </ImageUploadText>
                                        <HiddenFileInput
                                            id="image-upload"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        </FileInputContainer>
                                         {images.length > 0 && (
                                                        <Box>
                                                          <Typography variant="subtitle2" sx={{ mb: 1, color: "#555" }}>
                                                            Imágenes seleccionadas ({images.length})
                                                          </Typography>
                                                          <ImageGallery>
                                                            {images.map((image, index) => (
                                                              <ImageContainer key={index}>
                                                                <PreviewImage src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                                                                {/* <RemoveButton onClick={() => handleRemoveImage(index)}>
                                                                  <FiTrash2 size={16} />
                                                                </RemoveButton> */}
                                                              </ImageContainer>
                                                            ))}
                                                          </ImageGallery>
                                                        </Box>
                                                      )}
                                        
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowCreateForm(false)} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateItem} color="primary">
                            Crear
                        </Button>
                    </DialogActions>
                </Dialog>
        </Box>
    );
};

export default AdminItemDashboard;