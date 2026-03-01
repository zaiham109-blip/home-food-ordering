import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FoodProvider } from "./FoodContext"; // Hakikisha unayo hii faili
import Login from "./pages/Login";
import Signup from "./pages/Signup"; // Tumeongeza hii
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";

function App() {
  return (
    /* FoodProvider inazunguka kila kitu ili data ziweze kufika kote */
    <FoodProvider>
      <BrowserRouter>
        <Routes>
          {/* Ukurasa wa Kuingia */}
          <Route path="/" element={<Login />} />
          
          {/* Ukurasa wa Kujisajili */}
          <Route path="/signup" element={<Signup />} />

          {/* Dashboards za Watumiaji */}
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/delivery" element={<DeliveryDashboard />} />
        </Routes>
      </BrowserRouter>
    </FoodProvider>
  );
}

export default App;
