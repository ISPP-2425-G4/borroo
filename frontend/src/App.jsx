import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./Login";
import Signup from "./SignUp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
        </Route>
        {/* Ruta para la página de login */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
