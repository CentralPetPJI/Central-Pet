import { useState } from 'react';
import axios from 'axios';


const Login = () => {

  const [email, setEmail] = useState('');
  const [senha, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://127.0.0.1:3001/login', { email: email, senha: senha });
        alert(response.data.message);
;
        // Selecionar o roteamento da pagina que iremos usar apos o Login

        
      } catch (error: any) {
        const mensagemErro = error.response?.data?.message || error.message || "Erro desconhecido";
        alert("Erro: " + mensagemErro);
        console.error("Detalhes do erro:", error);
        // if (error.response) {
        //   alert(error.response.data.message);
        // } else {
        //   alert("Erro ao conectar com o servidor.");
        // }
      }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[50vh] mt-10">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-[450px] border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">Bem-vindo! 🐾</h2>
          <p className="text-gray-500 mt-2">Acesse sua conta no Pet Central</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 ml-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#6fe2f1] focus:ring-2 focus:ring-[#6fe2f1] outline-none transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 ml-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#6fe2f1] focus:ring-2 focus:ring-[#6fe2f1] outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-2 bg-[#6fe2f1] hover:bg-[#5bc8d6] text-gray-800 font-bold rounded-xl shadow-lg transform active:scale-95 transition-all"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-600">
            Ainda não tem conta?{' '}
            <a href="/register" className="text-[#5bc8d6] font-bold hover:underline">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;