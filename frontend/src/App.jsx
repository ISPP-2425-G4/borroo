import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./Login";
import CreateItem from "./CreateItem";
import Signup from "./SignUp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
        </Route>
        {/* Ruta para la página de login */}
        <Route path="/login" element={<Login />} />
        <Route path="/create-item" element={<CreateItem />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
