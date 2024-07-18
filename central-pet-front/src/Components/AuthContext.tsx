import { createContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";
import { User } from "../../../shared/types/User";

interface AuthContextProps {
  user: User | null;
  register: (formData: RegisterFormData) => Promise<void>;
  login: (formData: LoginFormData) => Promise<void>;
  logout: () => void;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  role: "user" | "institution";
  cpf?: string;
  cnpj?: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("auth-token");
      if (token) {
        try {
          const userRes = await api.get("auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(userRes.data);
        } catch (error) {
          console.error("Error fetching porofile: ", error);
          localStorage.removeItem("auth-token");
        }
      }
    };

    checkLoggedIn();
  }, []);

  const register = async (formData: RegisterFormData) => {
    try {
      const res = await api.post("auth/register", formData);
      localStorage.setItem("auth-token", res.data.token);
      setUser(res.data.user);
    } catch (error) {
      console.error("Error registering user: ", error);
      throw error;
    }
  };

  const login = async (formData: LoginFormData) => {
    try {
      const res = await api.post("auth/login", formData);
      localStorage.setItem("auth-token", res.data.token);
      setUser(res.data.user);
    } catch (error) {
      console.error("Error logging in: ", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
