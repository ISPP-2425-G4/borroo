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
import ListItemRequests from "./ListItemRequests";
import CreateItemRequest from "./CreateItemRequest";
import '../public/styles/App.css';
import FAQ from './components/Faq';
import AdminDashboard from "./AdminDashboard";
import TermsAndConditions from "./documents/TermsAndConditions";
import Sla from "./documents/Sla"
import PrivacyPolicy from "./documents/PrivacyPolicy";
import Licenses from "./documents/Licenses";
import VerificarEmail from "./VerifyEmail";
import AdminReportsDashboard from "./AdminReportsDashboard";
import Deposit from "./documents/Deposit";

function App() {
  return (
    <Router>
      <div className="app-container">
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
          <Route path="/faq" element={<FAQ />} />
          <Route path="/list_item_requests" element={<ListItemRequests />} />
          <Route path="/create_item_request" element={<CreateItemRequest />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/sla" element={<Sla/>}/>
          <Route path="/deposit" element={<Deposit/>}/>
          <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
          <Route path="/licenses" element={<Licenses/>}/>
          <Route path="/verifyEmail" element={<VerificarEmail />} />
          <Route path="/reports-dashboard" element={<AdminReportsDashboard />} />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
