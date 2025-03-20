import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { Box } from "@mui/system";

const DEFAULT_IMAGE = "../public/default_image.png";

const RentRequestBoard = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.id) {
                    alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
                    return;
                }
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/rentas/full/rental_requests/`,
                    { params: { user: user.id } }
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

    const handlePayment = async (renta) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/pagos/checkout-session/${renta.id}/`
            );
            const stripe = await window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
            const result = await stripe.redirectToCheckout({
                sessionId: response.data.id,
            });
            if (result.error) {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Error al iniciar el pago:", error);
        }
    };

    const handleResponse = async (renta, responseType) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.id) {
                alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
                return;
            }
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/rentas/full/${renta.id}/respond_request/`,
                {
                    response: responseType,
                    rent: renta.id
                }
            );
            console.log(response.data);

            // Filtrar la solicitud aceptada/rechazada de la lista
            setRequests((prevRequests) =>
                prevRequests.filter((request) => request.id !== renta.id)
            );
        } catch (error) {
            console.error(`Error al procesar la solicitud:`, error.response?.data || error.message);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Navbar />
            {requests.length === 0 ? (
                <Box sx={{ mt: 16, minHeight:"80vh" }}>
                <p>No hay solicitudes de alquiler disponibles.</p>
                </Box>
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
                                        onClick={() => handleResponse(request, "accepted")}
                                    >
                                        Aceptar
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                        onClick={() => handleResponse(request, "rejected")}
                                    >
                                        Rechazar
                                    </button>
                                    <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                    onClick={() => handlePayment(request)}
                                >
                                    Pagar
                                </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Box>
    );
};

export default RentRequestBoard;