import { useState, useEffect } from "react";


function App() {
  const [message, setMessage] = useState("Cargando...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/message/") // Petición a Django
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div>
      <h1>Frontend en React</h1>
      <h2>{message}</h2> {/* Muestra el mensaje del backend */}
    </div>
  );
}

export default App;
