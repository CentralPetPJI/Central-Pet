import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { User } from "@shared/types/User";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { LoginFormData, RegisterFormData } from "@/Models/FormData";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("auth-token");
      if (token) {
        try {
          await api
            .get(`${API_BASE_URL}/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => setUser(response.data))
            .catch(() => localStorage.removeItem("auth-token"));
        } catch (error) {
          console.error("Error fetching profile: ", error);
          localStorage.removeItem("auth-token");
        }
      }
    };

    checkLoggedIn();
  }, []);

  const register = async (formData: RegisterFormData) => {
    try {
      setError(null);
      await api.post(`${API_BASE_URL}/auth/register`, formData);
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response?.data?.msg || "Falha no cadastro");
      } else {
        setError("Erro ao registrar usuário. Por favor tente novamente.");
      }
      throw error;
    }
  };

  const login = async (formData: LoginFormData) => {
    try {
      setError(null);
      const res = await api.post(`${API_BASE_URL}/auth/login`, formData);
      localStorage.setItem("auth-token", res.data.token);
      setUser(res.data.user);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response?.data?.msg || "Falha no login");
      } else {
        setError("Falha no login. Por favor tente novamente");
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, register, login, logout, error, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
