import { createContext } from "react";
import { User } from "@shared/types/User";
import { LoginFormData, RegisterFormData } from "@/Models/FormData";

interface AuthContextProps {
  user: User | null;
  register: (formData: RegisterFormData) => Promise<void>;
  login: (formData: LoginFormData) => Promise<void>;
  logout: () => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);
