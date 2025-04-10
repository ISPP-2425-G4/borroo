// components/ImagePreview.jsx
import PropTypes from "prop-types";
import { Typography } from "@mui/material";
import {
  ImageGallery,
  ImageContainer,
  PreviewImage,
  RemoveButton
} from "./FormStyles";
import { FiTrash2 } from "react-icons/fi";

export const ImagePreviewGallery = ({ images, onRemove }) => (
  <>
    <Typography variant="subtitle2" sx={{ mb: 1, color: "#555" }}>
      Imágenes seleccionadas ({images.length})
    </Typography>
    <ImageGallery>
      {images.map((image, index) => (
        <ImageContainer key={index}>
          <PreviewImage src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
          <RemoveButton onClick={() => onRemove(index)}>
            <FiTrash2 size={16} />
          </RemoveButton>
        </ImageContainer>
      ))}
    </ImageGallery>
  </>
);

ImagePreviewGallery.propTypes = {
  images: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired,
};


