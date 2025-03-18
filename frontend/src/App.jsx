import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./Login";
import CreateItem from "./CreateItem";
import Signup from "./SignUp";
import UpdateItem from "./UpdateItem";
import ShowItem from "./ShowItem";
import SearchItemByName from "./SearchItemByName";
import RentRequestBoard from "./RentRequestBoard";

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
        <Route path="/rental_requests" element={<RentRequestBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
