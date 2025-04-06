import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    IconButton
  } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material'

const DeleteConfirmationDialog = ({ onConfirm }) => {
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
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleOpen}
        >
          Eliminar
        </Button>
  
        <Dialog
          open={open}
          onClose={handleClose}
        >
          <DialogTitle>¿Estás seguro de que quieres eliminar este ítem?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Esta acción no se puede deshacer. El objeto se eliminará permanentemente.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="outlined">Cancelar</Button>
            <Button onClick={handleConfirm} color="error" variant="contained">
              Sí, eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
  
  DeleteConfirmationDialog.propTypes = {
    onConfirm: PropTypes.func.isRequired,
  };
  
  export default DeleteConfirmationDialog;
