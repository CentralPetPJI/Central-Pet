import { useState } from "react";
import { useAuth } from "@/Contexts/useAuth";
import "./LoginPage.css";
import axios from "axios";

const LoginPage: React.FC = () => {
  const { login, error, setError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          // const apiErrors = error.response.data.errors.reduce(
          //   (
          //     acc: { [key: string]: string },
          //     err: { path: string; msg: string }
          //   ) => {
          //     acc[err.path] = err.msg;
          //     return acc;
          //   },
          //   {}
          // );
          //setErrors(apiErrors);
          // } else {
          //   setErrors({
          //     general: "An error occurred while registering the user.",
          //   });
          // }
          // } else {
          //   setErrors({ general: "An unknown error occurred." });
        }
      }
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login Page</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label className="form-label">
          Email:
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </label>
        <label className="form-label">
          Password:
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Password"
          />
        </label>
        <button type="submit" className="form-button">
          Login
        </button>
      </form>
      {error && <p className="error-label">{error}</p>}
    </div>
  );
};

export default LoginPage;
