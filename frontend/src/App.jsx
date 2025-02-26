import { useState, useEffect } from "react";


function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/usuarios/api/message/") 
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div>
      <h1>Frontend en React</h1>
      <h2>{message || "Cargando Mensaje"}</h2> 
    </div>
  );
}

export default App;
