import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiMail, FiInfo, FiPhone, FiMapPin, FiHome, FiFlag, FiCheckCircle } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
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
  Alert, 
  MenuItem, 
  Autocomplete,
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
    phone_number: "",
    country: "",
    city: "",
    address: "",
    postal_code: "",
    pricing_plan: "free" 
  });
  
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [countries, setCountries] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const requiredFields = ["username", "name", "surname", "email", "phone_number", "country", "city", "address", "postal_code", "password", "password2"];
    const isValid = requiredFields.every(field => formData[field] && formData[field].trim() !== "");
    setIsFormValid(isValid);
  }, [formData]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all?lang=es");
        const countryOptions = response.data.map(country => ({
          value: country.cca2,
          label: country.translations.spa.common
        }));
        setCountries(countryOptions);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCountryChange = (event, value) => {
    if (value && typeof value === 'object') {
      setFormData(prevData => ({
        ...prevData,
        country: value.label
      }));
    } 
    else if (typeof value === 'string') {
      setFormData(prevData => ({
        ...prevData,
        country: value
      }));
    }
    else {
      setFormData(prevData => ({
        ...prevData,
        country: ""
      }));
    }
  };

  const handleCountryKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      
      const inputValue = event.target.value.toLowerCase();
      
      const filteredCountries = countries.filter(country => 
        country.label.toLowerCase().includes(inputValue)
      );
      
      if (filteredCountries.length > 0) {
        setFormData(prevData => ({
          ...prevData,
          country: filteredCountries[0].label
        }));
      } else {
        setFormData(prevData => ({
          ...prevData,
          country: event.target.value
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");
    setFormErrors({});
  
    if (formData.password !== formData.password2) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
  
    const errors = {};
  
    if (!/^\+?[0-9]{7,15}$/.test(formData.phone_number)) {
      errors.phone_number = "Introduce un número de teléfono válido.";
    }
  
    const textFields = ["name", "surname", "country", "city", "address"];
    textFields.forEach(field => {
      if (formData[field] && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(formData[field])) {
        errors[field] = `El campo ${field} debe comenzar con una letra.`;
      }
    });

    if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos una letra mayúscula.";
    }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>/?])/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos un carácter especial.";
    }
    if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos un número.";
    }
    if (formData.password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres.";
    }
  
    const requiredFields = ["username", "name", "surname", "email", "phone_number", "country", "city", "address", "postal_code", "password", "password2"];
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
        const data = response.data;
  
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
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
              label="Número de teléfono"
              name="phone_number"
              required
              value={formData.phone_number}
              onChange={handleChange}
              error={!!formErrors.phone_number}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiPhone />
                  </InputAdornment>
                ),
              }}
            />
            {formErrors.phone_number && <FieldError>{formErrors.phone_number}</FieldError>}
            
            <Autocomplete
              options={countries}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option?.label || '';
              }}
              onChange={handleCountryChange}
              onKeyDown={handleCountryKeyDown}
              renderInput={(params) => (
                <StyledTextField
                  {...params}
                  label="País"
                  name="country"
                  variant="outlined"
                  fullWidth
                  error={!!formErrors.country}
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <FiFlag />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              freeSolo
              autoSelect
              filterOptions={(options, state) => {
                return options.filter(option => 
                  option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                );
              }}
              value={formData.country ? 
                (countries.find(c => c.label === formData.country) || formData.country) : 
                null
              }
            />
            {formErrors.country && <FieldError>{formErrors.country}</FieldError>}
            
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Ciudad"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              error={!!formErrors.city}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiMapPin />
                  </InputAdornment>
                ),
              }}
            />
            {formErrors.city && <FieldError>{formErrors.city}</FieldError>}
            
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Dirección"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              error={!!formErrors.address}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiHome />
                  </InputAdornment>
                ),
              }}
            />
            {formErrors.address && <FieldError>{formErrors.address}</FieldError>}
            
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Código postal (ej. 12345 o 12345-6789)"
              name="postal_code"
              required
              value={formData.postal_code}
              onChange={handleChange}
              error={!!formErrors.postal_code}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiMapPin />
                  </InputAdornment>
                ),
              }}
            />
            {formErrors.postal_code && <FieldError>{formErrors.postal_code}</FieldError>}
            
            <StyledTextField
              select
              variant="outlined"
              fullWidth
              label="Plan de precios"
              name="pricing_plan"
              value={formData.pricing_plan}
              onChange={handleChange}
              error={!!formErrors.pricing_plan}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiCheckCircle />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="free">Plan Free</MenuItem>
              <MenuItem value="basic">Plan Basic</MenuItem>
              <MenuItem value="premium">Plan Premium</MenuItem>
            </StyledTextField>
            {formErrors.pricing_plan && <FieldError>{formErrors.pricing_plan}</FieldError>}
            
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