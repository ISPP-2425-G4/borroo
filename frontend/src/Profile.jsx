import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Rating,
  TextField,
  Button,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PublicIcon from "@mui/icons-material/Public";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import HomeIcon from "@mui/icons-material/Home";
import MarkunreadMailboxIcon from "@mui/icons-material/MarkunreadMailbox";
import StarIcon from "@mui/icons-material/Star";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";


const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone_number: "",
    city: "",
    country: "",
    address: "",
    postal_code: "",
    pricing_plan: "free",
  });



  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/usuarios/perfil/?username=${encodeURIComponent(username)}`
        );
        setUser(response.data.user);
        setItems(response.data.objects);
      } catch (error) {
        console.error("Error cargando el perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      if (currentUser.username === username) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/usuarios/reviews/?username=${encodeURIComponent(username)}`
        );
        setReviews(response.data);

        const existingReview = response.data.find(
          (review) => review.reviewer_username === currentUser.username
        );

        if (existingReview) {
          setUserReview(existingReview);
          setReviewText(existingReview.comment);
          setRating(existingReview.rating);
        }
      } catch (error) {
        console.error("Error cargando las reseñas:", error);
      }
    };

    fetchProfile();
    fetchReviews();

  }, [username, currentUser?.username]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        city: user.city || "",
        country: user.country || "",
        address: user.address || "",
        postal_code: user.postal_code || "",
        pricing_plan: user.pricing_plan || "free",
      });
    }
  }, [user]);


  const handleReviewSubmit = async () => {
    if (!rating) {
      alert("Debes seleccionar una valoración.");
      return;
    }

    try {
      const reviewData = {
        reviewer_username: currentUser.username,
        reviewed_username: user.username,
        rating: rating,
        comment: reviewText,
      };

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/usuarios/reviews/create/`, reviewData);

      const updatedReviewsResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/reviews/?username=${encodeURIComponent(username)}`
      );
      setReviews(updatedReviewsResponse.data);

      const updatedUserReview = updatedReviewsResponse.data.find(
        (review) => review.reviewer_username === currentUser.username
      );
      setUserReview(updatedUserReview);

      alert("Valoración enviada con éxito.");
    } catch (error) {
      console.error("Error enviando la valoración:", error);
      alert("No se pudo enviar la valoración.");
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar tu reseña?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/reviews/delete/`,
        {
          data: { reviewer_username: currentUser.username, reviewed_username: user.username },
        }
      );

      // Eliminar la reseña del estado
      setReviews((prevReviews) => prevReviews.filter((review) => review.reviewer_username !== currentUser.username));
      setUserReview(null);
      setReviewText("");
      setRating(0);

      alert("Reseña eliminada con éxito.");
    } catch (error) {
      console.error("Error eliminando la reseña:", error);
      alert("No se pudo eliminar la reseña.");
    }
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("No tienes una sesión activa. Inicia sesión nuevamente.");
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/users/delete/${user.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Usuario eliminado correctamente.");
      window.location.href = "/";
    } catch {
      alert("No se pudo eliminar el usuario.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("No tienes una sesión activa. Inicia sesión nuevamente.");
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/users/update/${user.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Usuario actualizado correctamente.");
      setUser(response.data);
      setEditMode(false);
    } catch (error) {
      console.error("Error actualizando el usuario:", error?.response || error);
      alert("No se pudo actualizar el usuario.");
    }
  };


  if (loading) return <Typography align="center">Cargando perfil...</Typography>;
  if (!user) return <Typography color="error">No se encontró el perfil.</Typography>;

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          {/* 📌 AVATAR Y DATOS PRINCIPALES */}
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              {user.name} {user.surname}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              @{user.username}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 📌 DATOS ADICIONALES */}
          <Box
            sx={{
              textAlign: "middle",
              mt: 3,
              p: 3,
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
              Información de contacto:
            </Typography>
            <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
              <EmailIcon sx={{ verticalAlign: "middle", fontSize: 24 }} />{" "}
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
              <PhoneIcon sx={{ verticalAlign: "middle", fontSize: 24 }} />{" "}
              <strong>Teléfono:</strong> {user.phone_number}
            </Typography>

            <Typography variant="h5" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              Ubicación:
            </Typography>
            <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
              <PublicIcon sx={{ verticalAlign: "middle", fontSize: 24 }} />{" "}
              <strong>País:</strong> {user.country}
            </Typography>
            <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
              <LocationCityIcon sx={{ verticalAlign: "middle", fontSize: 24 }} />{" "}
              <strong>Ciudad:</strong> {user.city}
            </Typography>
            <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
              <HomeIcon sx={{ verticalAlign: "middle", fontSize: 24 }} />{" "}
              <strong>Dirección:</strong> {user.address}
            </Typography>
            <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
              <MarkunreadMailboxIcon sx={{ verticalAlign: "middle", fontSize: 24 }} />{" "}
              <strong>Código Postal:</strong> {user.postal_code}
            </Typography>

            <Typography variant="h5" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              Plan de Suscripción:
            </Typography>
            <Typography sx={{ fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", }}>
              {user.pricing_plan === "premium" ? (
                <>
                  <StarIcon sx={{ verticalAlign: "middle", fontSize: 24, color: "#FFD700" }} />{" "}
                  <strong>Premium</strong>
                </>
              ) : (
                <>
                  <MoneyOffIcon sx={{ verticalAlign: "middle", fontSize: 24, color: "#4CAF50" }} />{" "}
                  <strong>Gratis</strong>
                </>
              )}
            </Typography>
          </Box>


          <Divider sx={{ my: 3 }} />

          {/* 📌 PRODUCTOS EN ALQUILER */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Productos en alquiler de {user.name}
          </Typography>

          {items.length > 0 ? (
            <Grid container spacing={3} justifyContent="center">
              {items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Link to={`/show-item/${item.id}`} style={{ textDecoration: "none" }}>
                    <Card elevation={3}
                      sx={{
                        borderRadius: 3,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography variant="h6" fontWeight="bold">
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {item.description}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold", color: "#388E3C" }}>
                          💰 {item.price} € / {item.price_category_display}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Este usuario aún no ha publicado productos.
            </Typography>
          )}

          {/* 📌 RESEÑAS (SOLO PARA OTROS PERFILES) */}
          {currentUser.username !== user.username && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6">
                {userReview ? "Editar tu valoración:" : "Deja una valoración:"}
              </Typography>
              <Rating value={rating} onChange={(event, newValue) => setRating(newValue)} />
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Escribe un comentario..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Button variant="contained" color="primary" onClick={handleReviewSubmit} sx={{ mt: 2, width: "100%" }}>
                {userReview ? "Actualizar valoración" : "Enviar valoración"}
              </Button>

              {/* 📌 SECCIÓN PARA MOSTRAR LA RESEÑA DEL USUARIO ACTUAL CON PAPELERA */}
              {userReview && (
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#f9f9f9" }}>
                  <Box>
                    <Typography variant="subtitle2">
                      <strong>{userReview.reviewer_username}:</strong> {userReview.comment}
                    </Typography>
                    <Rating value={userReview.rating} precision={0.5} readOnly />
                  </Box>
                  <IconButton onClick={handleDeleteReview} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}

              <Box sx={{ mt: 4, textAlign: "left" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Reseñas de otros usuarios:</Typography>
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2">
                        <strong>{review.reviewer_username}:</strong> {review.comment}
                      </Typography>
                      <Rating value={review.rating} precision={0.5} readOnly />
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">Aún no hay reseñas para este usuario.</Typography>
                )}
              </Box>
            </>
          )}
          {/* 📌 BOTONES DE ADMINISTRADOR */}
          {currentUser?.is_admin && currentUser.username !== user.username && (
            <>
              <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Cancelar edición" : "Editar usuario"}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteUser}
                  startIcon={<DeleteIcon />}
                >
                  Eliminar usuario
                </Button>
              </Box>

              {editMode && (
                <Box sx={{ mt: 3, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Editar información del usuario
                  </Typography>

                  <Grid container spacing={2}>
                    {["name", "surname", "email", "phone_number", "city", "country", "address", "postal_code"]
                      .map((field) => (
                        <Grid item xs={12} sm={6} key={field}>
                          <TextField
                            fullWidth
                            label={field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
                            name={field}
                            value={formData[field]}
                            onChange={handleInputChange}
                          />
                        </Grid>
                      ))}

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Plan de Suscripción"
                        name="pricing_plan"
                        value={formData.pricing_plan}
                        onChange={handleInputChange}
                        fullWidth
                      >
                        <MenuItem value="free">🟢 Gratis</MenuItem>
                        <MenuItem value="premium">🌟 Premium</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                  <Box sx={{ textAlign: "right", mt: 2 }}>
                    <Button variant="contained" onClick={handleUpdateUser}>
                      Guardar cambios
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default Profile;
