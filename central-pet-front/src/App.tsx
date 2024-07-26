import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./Contexts/AuthProvider";
import "./App.css";
import Layout from "./Layout/Layout";
import MainPage from "@/Pages/MainPage";
import RegisterPage from "@/Pages/RegisterPage/RegisterPage";
import LoginPage from "@/Pages/LoginPage/LoginPage";
import NotFoundPage from "@/Pages/NotFoundPage/NotFoundPage";
import AboutPage from "@/Pages/Help/AboutPage/AboutPage";
import CadastroPetAjuda from "@/Pages/Help/Instructions/CadastroPetAjuda";
import RegisterPetPage from "@/Pages/Pets/Register/RegisterPet";
//import PrivateRoute from "./Components/PrivateRoute";
import "@/styles/global.css";
import { useEffect } from "react";
import api from "./services/api";

const App: React.FC = () => {
  useEffect(() => {
    const watch = async () => {
      const teste = await api.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pets/hello`
      );
      console.log(teste);
    };

    watch();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/instructions" element={<CadastroPetAjuda />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<MainPage />} />
            <Route path="/pets/register" element={<RegisterPetPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App;

// <Route path="/" element={<MainPage />} />
