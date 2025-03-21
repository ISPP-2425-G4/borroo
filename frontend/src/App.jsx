import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./Login";
import CreateItem from "./CreateItem";
import Signup from "./SignUp";
import UpdateItem from "./UpdateItem";
import ShowItem from "./ShowItem";
import SearchItemByName from "./SearchItemByName";
import RentRequestBoard from "./RentRequestBoard";
import Footer from './components/Footer';
import RecoverPassword from "./RecoverPassword";
import RecoverPasswordDone from "./RecoverPasswordDone";
import RecoverPasswordNew from "./RecoverPasswordNew";
import SubscriptionScreen from "./SubscriptionScreen";
import DraftItemsView from "./DraftsScreen"; 
import Profile from "./Profile";


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
        <Route path="/pricing-plan" element={<SubscriptionScreen />} />
        <Route path="/recoverPassword" element={<RecoverPassword />} />
        <Route path="/recoverPasswordDone" element={<RecoverPasswordDone />} />
        <Route path="/recoverPasswordNew" element={<RecoverPasswordNew />} />
        <Route path="/drafts" element={<DraftItemsView />} />
        <Route path="/perfil/:username" element={<Profile />} />
        <Route path="/show-item/:id" element={<ShowItem />} />
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
