
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import Payments from "./pages/Payments";
import Clients from "./pages/Clients";
import Assistant from "./pages/Assistant";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import PublicInvoice from "./pages/PublicInvoice";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Public invoice - no login required */}
      <Route path="/public/invoice/:token" element={<PublicInvoice />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/create-invoice" element={<CreateInvoice />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/assistant" element={<Assistant />} />
      <Route path="/insights" element={<Insights />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
