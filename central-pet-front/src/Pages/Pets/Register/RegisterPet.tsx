import React, { useState } from "react";
import { useAuth } from "../../../Contexts/useAuth.ts";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import axios from "axios";

const RegisterPetPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    caracteristicasFisicas: "",
    caracteristicasComportamentais: "",
    observacoes: "",
    photo: "",
    species: "",
    forAdoption: true,
    age: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (errors && successMessage) {
    //
  }

  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    try {
      await api.post("/pets/register", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      setSuccessMessage("Pet cadastrado com sucesso");
      setFormData({
        name: "",
        caracteristicasFisicas: "",
        caracteristicasComportamentais: "",
        observacoes: "",
        photo: "",
        species: "",
        forAdoption: true,
        age: 0,
      });
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
              err: { param: string; msg: string }
            ) => {
              acc[err.param] = err.msg;
              return acc;
            },
            {}
          );
          setErrors(apiErrors);
        } else {
          setErrors({
            general: "An error occurred while registering the pet.",
          });
        }
      } else {
        setErrors({ general: "An unknown error occurred." });
      }
    }
  };

  return (
    <div>
      <h2>Register Pet</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          name="caracteristicasFisicas"
          placeholder="Physical Characteristics"
          value={formData.caracteristicasFisicas}
          onChange={handleChange}
        />
        <input
          name="caracteristicasComportamentais"
          placeholder="Behavioral Characteristics"
          value={formData.caracteristicasComportamentais}
          onChange={handleChange}
        />
        <input
          name="observacoes"
          placeholder="Observations"
          value={formData.observacoes}
          onChange={handleChange}
        />
        <input
          name="photo"
          placeholder="Photo URL"
          value={formData.photo}
          onChange={handleChange}
        />
        <input
          name="species"
          placeholder="Species"
          value={formData.species}
          onChange={handleChange}
        />
        <input
          name="age"
          placeholder="Age"
          type="number"
          value={formData.age}
          onChange={handleChange}
        />
        <label>
          Para Adoção:
          <input
            name="forAdoption"
            type="checkbox"
            checked={formData.forAdoption}
            onChange={(e) =>
              setFormData({ ...formData, forAdoption: e.target.checked })
            }
          />
        </label>
        <button type="submit">Cadastrar Pet</button>
      </form>
    </div>
  );
};

export default RegisterPetPage;
