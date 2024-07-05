import React, { useState } from "react";
import "./RegisterPage.css";

const RegisterPage: React.FC = () => {
  const [registrationType, setRegistrationType] = useState<string>("user");

  const handleRegistrationTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRegistrationType(event.target.value);
  };

  return (
    <div className="flex flex-col items-center p-4 h-full">
      <h1 className="text-2xl font-bold mb-4">
        Registro de Usuário ou Instituição
      </h1>
      <form className="w-full mt-5 max-w-lg h-auto bg-white p-6 rounded-2xl shadow-md">
        <label className="block mb-4">
          Tipo de Registro:
          <select
            value={registrationType}
            onChange={handleRegistrationTypeChange}
            className="block w-full mt-2 p-2 border rounded"
          >
            <option value="user">Usuário</option>
            <option value="institution">Instituição</option>
          </select>
        </label>
        <label className="block mb-4">
          Nome do usuário:
          <input type="text" className="block w-full mt-2 p-2 border rounded" />
        </label>
        <label className="block mb-4">
          E-mail:
          <input
            type="email"
            className="block w-full mt-2 p-2 border rounded"
          />
        </label>
        <label className="block mb-4">
          Senha:
          <input
            type="password"
            className="block w-full mt-2 p-2 border rounded"
          />
        </label>
        <label className="block mb-4">
          Repetir a senha:
          <input
            type="password"
            className="block w-full mt-2 p-2 border rounded"
          />
        </label>
        {registrationType === "user" && (
          <label className="block mb-4">
            CPF:
            <input
              type="text"
              className="block w-full mt-2 p-2 border rounded"
            />
          </label>
        )}
        {registrationType === "institution" && (
          <label className="block mb-4">
            CNPJ:
            <input
              type="text"
              className="block w-full mt-2 p-2 border rounded"
            />
          </label>
        )}
        <button
          type="submit"
          className="w-[50%] ml-[25%] p-2 my-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
