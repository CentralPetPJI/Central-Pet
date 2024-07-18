import React, { useState } from "react";
import { useAuth } from "@/Components/useAuth";
import "./RegisterPage.css";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  role: "user" | "institution";
  cpf?: string;
  cnpj?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const { register } = useAuth();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register(formData);
  };

  const handleRegistrationTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      role: event.target.value as "user" | "institution",
    });
  };

  return (
    <div className="register-page-container">
      <h1 className="register-page-title">
        Registro de Usuário ou Instituição
      </h1>
      <form className="register-form" onSubmit={onSubmit}>
        <label className="form-label">
          Tipo de Registro:
          <select
            name="role"
            value={formData.role}
            onChange={handleRegistrationTypeChange}
            className="form-select"
          >
            <option value="user">Usuário</option>
            <option value="institution">Instituição</option>
          </select>
        </label>
        <label className="form-label">
          Nome do usuário:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={onChange}
            className="form-input"
          />
        </label>
        <label className="form-label">
          E-mail:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="form-input"
          />
        </label>
        <label className="form-label">
          Senha:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            className="form-input"
          />
        </label>
        <label className="form-label">
          Repetir a senha:
          <input type="password" className="form-input" />
        </label>
        {formData.role === "user" && (
          <label className="form-label">
            CPF:
            <input type="text" className="form-input" />
          </label>
        )}
        {formData.role === "institution" && (
          <label className="form-label">
            CNPJ:
            <input type="text" className="form-input" />
          </label>
        )}
        <button type="submit" className="form-button">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
