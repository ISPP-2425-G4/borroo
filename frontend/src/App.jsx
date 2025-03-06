import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./Login";
import CreateItem from "./CreateItem";
import Signup from "./SignUp";
import UpdateItem from "./UpdateItem";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
        </Route>
        {/* Ruta para la página de login */}
        <Route path="/login" element={<Login />} />
        <Route path="/create-item" element={<CreateItem />} />
        <Route path="/update-item/:id" element={<UpdateItem />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
