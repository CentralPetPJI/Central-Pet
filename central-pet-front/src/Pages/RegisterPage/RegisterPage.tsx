import { useState, useEffect } from "react";
import { useAuth } from "@/Contexts/useAuth";
import "./RegisterPage.css";
import axios from "axios";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: "user" | "institution";
  cpf?: string;
  cnpj?: string;
  createdAt: Date;
  updatedAt: Date;
}

type ErrorState = {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  cpf?: string;
  cnpj?: string;
  general?: string;
};

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [errors, setErrors] = useState<ErrorState>({});
  const { register, setError } = useAuth();

  useEffect(() => {
    setError(null);
  }, [setError]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    try {
      await register(formData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          const apiErrors = error.response.data.errors.reduce(
            (
              acc: { [key: string]: string },
              err: { path: string; msg: string }
            ) => {
              acc[err.path] = err.msg;
              return acc;
            },
            {}
          );
          setErrors(apiErrors);
        } else {
          setErrors({
            general: "An error occurred while registering the user.",
          });
        }
      } else {
        setErrors({ general: "An unknown error occurred." });
      }
    }
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
          {errors?.username && <p className="error-label">{errors.username}</p>}
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
          {errors.email && <p className="error-label">{errors.email}</p>}
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
          {errors.password && <p className="error-label">{errors.password}</p>}
        </label>
        <label className="form-label">
          Repetir a senha:
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={onChange}
            className="form-input"
          />
          {errors.passwordConfirm && (
            <p className="error-label">{errors.passwordConfirm}</p>
          )}
        </label>
        {formData.role === "user" && (
          <label className="form-label">
            CPF:
            <input
              type="text"
              name="cpf"
              value={formData.cpf || ""}
              onChange={onChange}
              className="form-input"
            />
            {errors.cpf && <p className="error-label">{errors.cpf}</p>}
          </label>
        )}
        {formData.role === "institution" && (
          <label className="form-label">
            CNPJ:
            <input
              type="text"
              name="cnpj"
              value={formData.cnpj || ""}
              onChange={onChange}
              className="form-input"
            />
            {errors.cnpj && <p className="error-label">{errors.cnpj}</p>}
          </label>
        )}
        <button type="submit" className="form-button">
          Register
        </button>
      </form>
      {errors.general && <p className="error-label">{errors.general}</p>}
    </div>
  );
};

export default RegisterPage;
