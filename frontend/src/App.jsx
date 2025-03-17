import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./Login";
import CreateItem from "./CreateItem";
import Signup from "./SignUp";
import UpdateItem from "./UpdateItem";
import ShowItem from "./ShowItem";
import SearchItemByName from "./SearchItemByName";
import RecuperarContraseñaConfirm from "./RecuperarContraseñaConfirm";
import RecuperarContraseñaComplete from "./RecuperarContraseñaComplete";
import RecuperarContraseña from "./RecuperarContraseña";

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
        <Route path="/show-item/:id" element={<ShowItem />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/objetos/search_item" element={<SearchItemByName />} />
        <Route path="/recoverPassword" element={<RecuperarContraseñaConfirm />} />
        <Route path="/recoverPasswordDone" element={<RecuperarContraseñaComplete />} />
        <Route path="/recoverPasswordNew" element={<RecuperarContraseña />} />

      </Routes>
    </Router>
  );
}

export default App;
