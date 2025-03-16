import { useState, useEffect } from 'react';
import axios from 'axios';

const DEFAULT_IMAGE = "../public/default_image.png"; // Reemplaza con la ruta correcta de la imagen por defecto

const RentRequestBoard = () => {
    const [rentRequests, setRentRequests] = useState([]);
    //const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            //try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/rentas/all-requests/`
                );

                const data = response.data;
                if (data.results) {
                    const rentasConImagen = await Promise.all(
                        data.results.map(async (renta) => {
                            const imageUrl = renta.item.images && renta.item.images.length > 0
                                ? await obtenerImagen(renta.item.images[0])
                                : DEFAULT_IMAGE;
                            return { ...renta, imageUrl };
                        })
                    );
                    setRentRequests(rentasConImagen);
                } /*else {
                    setError("No rent requests found");
                }
            } catch (error) {
                setError(error.message);
            }*/
        };
        fetchRequests();
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

    return (
    <div>
        {rentRequests.length === 0 ? (
            <p>No items requested</p>
        ) : (
            rentRequests.map((request) => (
                <div key={request.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
                    <img src={request.imageUrl} alt="Item" style={{ width: '100px', height: '100px' }} />
                    <p>Item Name: {request.item.name}</p>
                    <p>Requester: {request.renter.name}</p>
                    <p>Start Date: {request.start_date}</p>
                    <p>End Date: {request.end_date}</p>
                    <button style={{ backgroundColor: 'green', color: 'white', marginRight: '10px' }}>Aceptar</button>
                    <button style={{ backgroundColor: 'red', color: 'white' }}>Rechazar</button>
                </div>
            ))
        )}
    </div>
    );
};

export default RentRequestBoard;