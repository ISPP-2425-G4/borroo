import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const EditConfirmationDialog = ({ onConfirm }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleConfirm = () => {
    handleClose();
    onConfirm();
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={handleOpen}
      >
        Editar
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>¿Deseas editar este ítem?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Serás redirigido al formulario de edición. Asegúrate de tener todos los datos actualizados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">Cancelar</Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">
            Sí, editar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

EditConfirmationDialog.propTypes = {
  onConfirm: PropTypes.func.isRequired,
};

export default EditConfirmationDialog;
