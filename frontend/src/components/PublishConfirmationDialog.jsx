import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PublishConfirmationDialog = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>¡Publicación exitosa!</DialogTitle>
      <DialogContent>
        <DialogContentText>
          La publicación se ha llevado correctamente. ¡Ya está disponible!
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PublishConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PublishConfirmationDialog;
