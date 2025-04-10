import { Box, Paper, Typography } from "@mui/material";
import { styled } from "@mui/system";

export const ImageGallery = styled(Box)(() => ({
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  marginTop: "16px",
  marginBottom: "24px",
}));

export const ImageContainer = styled(Box)(() => ({
  position: "relative",
  width: "150px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
}));

export const PreviewImage = styled("img")(() => ({
  width: "100%",
  height: "120px",
  objectFit: "cover",
}));

export const RemoveButton = styled("button")(() => ({
  position: "absolute",
  top: "8px",
  right: "8px",
  background: "rgba(0, 0, 0, 0.5)",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background 0.2s",
  "&:hover": {
    background: "rgba(0, 0, 0, 0.7)",
  },
}));

export const FileInputContainer = styled(Box)(() => ({
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

export const HiddenFileInput = styled("input")({
  display: "none",
});

export const ImageUploadText = styled(Typography)(() => ({
  marginTop: "8px",
  color: "#666",
  fontSize: "0.9rem",
}));

export const FormContainer = styled(Paper)(() => ({
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  width: "100%",
  maxWidth: "800px",
  margin: "2rem auto",
}));

export const FormTitle = styled(Typography)(() => ({
  fontSize: "1.75rem",
  fontWeight: 600,
  marginBottom: "1.5rem",
  color: "#333",
}));

export const ErrorMessage = styled(Typography)(() => ({
  color: "#d32f2f",
  fontSize: "0.8rem",
  marginTop: "-12px",
  marginBottom: "12px",
}));

export const SubmitButton = styled("button")(({ disabled }) => ({
  width: "100%",
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  background: disabled ? "#cccccc" : "#4a90e2",
  color: "white",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "background 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  "&:hover": {
    background: disabled ? "#cccccc" : "#3a7bc8",
  },
}));