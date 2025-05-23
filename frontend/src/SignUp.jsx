import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiMail, FiInfo, FiBriefcase } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Checkbox, FormControlLabel, Alert, Snackbar } from "@mui/material"; 
import axios from 'axios';
import Navbar from "./Navbar";
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton, 
  CircularProgress, 
  styled
} from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 550,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: 8,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
}));

const FormContainer = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2)
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  padding: theme.spacing(1.2),
  borderRadius: 4
}));

const LinkText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  textAlign: 'center',
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
    }
  }
}));

const FieldError = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '0.75rem',
  marginTop: theme.spacing(-1),
  marginBottom: theme.spacing(1)
}));

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    password2: "",
    cif: "",
  });
  
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const [isCompany, setIsCompany] = useState(false);
  const [notification, setNotification] =  useState({ open: false, message: "", severity: "success" });
  
  useEffect(() => {
    const { username, name, surname, email, password, password2, cif } = formData;
    const fields = [username, name, surname, email, password, password2];
  
    if (isCompany) {
      fields.push(cif);
    }

    const isValid =
      fields.every(field => typeof field === 'string' && field.trim() !== "") &&
      acceptTerms;
  
    setIsFormValid(isValid);
  }, [formData, acceptTerms, isCompany]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    if(!acceptTerms) {
      setError("Debe aceptar los términos y condiciones.");
      return;
    }
    
    if (isCompany && !formData.cif.trim()) {
      setError("El campo NIF es obligatorio para perfiles de empresa.");
      return;
    }

    setLoading(true);
    setError("");
    setFormErrors({});
  
    if (formData.password !== formData.password2) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
  
    const errors = {};
  
    const textFields = ["name", "surname"];
    textFields.forEach(field => {
      if (formData[field] && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(formData[field])) {
        errors[field] = `El campo ${field} debe comenzar con una letra.`;
      }
    });

    if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
    }
    if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
    }
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};:"\\|,.<>/?])/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
    }
    if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
    }
    if (formData.password.length < 8) {
      errors.password = "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
    }
  
    const requiredFields = ["username", "name", "surname", "email", "password", "password2"];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = "Este campo es obligatorio.";
      }
    });

    try {
      const usernameCheckResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/check_username/`,
        { params: { username: formData.username } }
      );

      if (usernameCheckResponse.data.exists) {
        errors.username = "El nombre de usuario ya existe.";
      }

      if (isCompany) {
        requiredFields.push("cif");
      }

      if (!/^[A-HJ-NP-SUVW]\d{7}[0-9A-J]$/.test(formData.cif) && isCompany) {
        errors.cif = "El NIF no es válido. Debe comenzar con una letra seguida de 7 dígitos y una letra o número final.";
      }

    } catch (error) {
      console.error("Error verificando el nombre de usuario:", error);
      setError("Error verificando el nombre de usuario");
      setLoading(false);
      return;
    }

    try {
      const emailCheckResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/check_email/`,
        { params: { email: formData.email } }
      );

      if (emailCheckResponse.data.exists) {
        errors.email = "El correo electrónico ya existe.";
      }
    } catch (error) {
      console.error("Error verificando el correo electrónico:", error);
      setError("Error verificando el correo electrónico");
      setLoading(false);
      return;
    }
  
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }
  
    try {
      const submitFormData = new FormData();
  
      Object.keys(formData).forEach(key => {
        if (key !== 'password2') { 
          submitFormData.append(key, formData[key]);
        }
      });
  
      submitFormData.append("password1", formData.password); 

      submitFormData.append("cif", formData.cif);
  
      console.log("Datos enviados:", Object.fromEntries(submitFormData.entries()));
  
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/`,
        submitFormData,
        {
          withCredentials: true,
        }
      );
  
      console.log("Respuesta del servidor:", response);
  
      if (response.status === 201) {
        setNotification({
          open: true,
          message: "Se ha enviado una enlace para verificar el correo. Redirigiendo...",
          severity: "success"
        });
        setTimeout(() => {
          setNotification({ ...notification, open: false });
          navigate("/login");
        }
        , 3000);
      } else {
        const data = response.data;
  
        if (typeof data === 'object' && !Array.isArray(data)) {
          setFormErrors(data);
        } else {
          throw new Error("Error al registrar usuario");
        }
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      if (error.response) {
        const data = error.response.data;
  
        if (data.postal_code) {
          setError("Código postal incorrecto. Verifique e intente de nuevo.");
        } else {
          setError(error.message || "Error al conectar con el servidor");
        }
  
        setFormErrors(data);
      } else {
        setError("Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{mt: 8}}>
        <StyledPaper elevation={3}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Registrarse
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <FormContainer onSubmit={handleSubmit}>
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Nombre de usuario"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiUser />
                  </InputAdornment>
                ),
              }}
            />
            {formErrors.username && <FieldError>{formErrors.username}</FieldError>}
            
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Nombre"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiInfo />
                  </InputAdornment>
                ),
              }}
            />
            {formErrors.name && <FieldError>{formErrors.name}</FieldError>}
            
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Apellido"
              name="surname"
              required
              value={formData.surname}
              onChange={handleChange}
              error={!!formErrors.surname}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiInfo />
                  </InputAdornment>
                ),
              }}
            />
            {formErrors.surname && <FieldError>{formErrors.surname}</FieldError>}
            
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Correo electrónico"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiMail />
                  </InputAdornment>
                ),
              }}
            />
            {formErrors.email && <FieldError>{formErrors.email}</FieldError>}
            
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiLock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {formErrors.password && <FieldError>{formErrors.password}</FieldError>}
            
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Confirmar contraseña"
              name="password2"
              type={showPassword2 ? "text" : "password"}
              required
              value={formData.password2}
              onChange={handleChange}
              error={!!formErrors.password2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiLock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword2(!showPassword2)}
                      edge="end"
                    >
                      {showPassword2 ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {formErrors.password2 && <FieldError>{formErrors.password2}</FieldError>}

            <FormControlLabel
              control={
                <Checkbox
                  checked={isCompany}
                  onChange={(e) => setIsCompany(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Perfil de empresa
                </Typography>
              }
            />
            {isCompany && (
              <>
                <StyledTextField
                  variant="outlined"
                  fullWidth
                  label="NIF"
                  name="cif"
                  required
                  value={formData.cif}
                  onChange={handleChange}
                  error={!!formErrors.cif}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiBriefcase />
                      </InputAdornment>
                    ),
                  }}
                />
                {formErrors.cif && <FieldError>{formErrors.cif}</FieldError>}
              </>
            )}
            <Snackbar
                open={notification.open}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }} // Centrado en la parte superior
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{
                        width: "100%",
                        fontSize: "18px", // Tamaño de fuente más grande
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
            <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    He leído y acepto los <Link to="/terms-and-conditions">términos y condiciones</Link>.
                  </Typography>
                }
              />
              {error && !acceptTerms && <FieldError>Debes aceptar los términos y condiciones.</FieldError>}
            
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={!isFormValid || loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Crear cuenta"}
            </StyledButton>
          </FormContainer>
          
          <LinkText variant="body2">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </LinkText>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default Signup;