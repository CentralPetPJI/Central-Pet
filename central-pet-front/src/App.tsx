import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./Components/AuthContext";
import "./App.css";
import Layout from "./Layout/Layout";
import MainPage from "@/Pages/MainPage";
import RegisterPage from "@/Pages/RegisterPage/RegisterPage";
import LoginPage from "@/Pages/LoginPage/LoginPage";
import NotFoundPage from "@/Pages/NotFoundPage/NotFoundPage";
import AboutPage from "@/Pages/Help/AboutPage/AboutPage";
import CadastroPetAjuda from "@/Pages/Help/Instructions/CadastroPetAjuda";
//import PrivateRoute from "./Components/PrivateRoute";
import "@/styles/global.css";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/instructions" element={<CadastroPetAjuda />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<MainPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;

// <Route path="/" element={<MainPage />} />
