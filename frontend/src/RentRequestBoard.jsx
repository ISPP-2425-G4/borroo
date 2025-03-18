import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";

const DEFAULT_IMAGE = "../public/default_image.png";

const RentRequestBoard = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/rentas/full/rental_requests/`
                );
                console.log("Datos recibidos del backend:", response.data);

                const data = response.data;
                const rentas = data.results ?? data; // Si `results` no existe, usa `data` directamente

                // Obtener las imágenes asociadas a cada renta
                const rentasConImagen = await Promise.all(
                    rentas.map(async (renta) => {
                        const imageUrl =
                            renta.item?.images?.length > 0
                                ? await obtenerImagen(renta.item.images[0])
                                : DEFAULT_IMAGE;
                        return { ...renta, imageUrl };
                    })
                );
                setRequests(rentasConImagen);
            } catch (error) {
                console.error("Error al obtener solicitudes de alquiler:", error);
            }
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

    const handleAccept = (renta) => {
        console.log(`Aceptar solicitud de alquiler: ${renta.title}`);
        // Lógica para aceptar la solicitud (por ejemplo, cambiar estado en backend)
    };

    const handleReject = (renta) => {
        console.log(`Rechazar solicitud de alquiler: ${renta.title}`);
        // Lógica para rechazar la solicitud (por ejemplo, cambiar estado en backend)
    };

    return (
        <div className="p-4">
            <Navbar />
            {requests.length === 0 ? (
                <p>No hay solicitudes de alquiler disponibles.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requests.map((request) => (
                        <div key={request.id} className="shadow-md rounded-lg overflow-hidden">
                            <img
                                src={request.imageUrl}
                                alt={request.title}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{request.title}</h3>
                                <p className="text-sm text-gray-600">Solicitado por: {request.renter?.username}</p>
                                <p className="text-sm">Inicio: {new Date(request.start_date).toLocaleDateString()}</p>
                                <p className="text-sm">Fin: {new Date(request.end_date).toLocaleDateString()}</p>
                                <div className="mt-4 flex justify-between">
                                    <button
                                        className="bg-green-500 text-white px-4 py-2 rounded"
                                        onClick={() => handleAccept(request)}
                                    >
                                        Aceptar
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                        onClick={() => handleReject(request)}
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RentRequestBoard;