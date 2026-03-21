import { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [role, setRole] = useState<'adotante' | 'ong'>('adotante');

  const [formData, setFormData] = useState({
    nome: '', nascimento: '', cpf: '', cnpj: '', nomeOng: '', email: '', senha: '', confirmarSenha: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {return alert("As senhas não coincidem!");}

    const url = role === 'adotante' 
      ? 'http://localhost:3001/registrar/adotante' 
      : 'http://localhost:3001/registrar/ong';

    try {
      const response = await axios.post(url, formData);
      alert(response.data.message);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message); 
      } else {
      console.error(error);
        alert("Erro de conexão. O servidor (Node.js)");
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[75vh] py-10 bg-slate-100">
      <div className="bg-slate-50 p-6 rounded-3xl shadow-2xl w-full max-w-[650px] border border-slate-200">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800">Criar Conta 🐾</h2>
          <p className="text-sm text-slate-500 font-medium">Rápido e fácil!</p>
        </div>

        <div className="flex justify-center gap-4 mb-8 bg-slate-200/60 p-1.5 rounded-xl w-fit mx-auto">
          <button type="button" onClick={() => setRole('adotante')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${role === 'adotante' ? 'bg-[#6fe2f1] text-slate-900 shadow-md' : 'text-slate-600'}`}>Quero Adotar</button>
          <button type="button" onClick={() => setRole('ong')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${role === 'ong' ? 'bg-[#6fe2f1] text-slate-900 shadow-md' : 'text-slate-600'}`}>Sou uma ONG</button>
        </div>

  
        <form onSubmit={handleFinalizar} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {role === 'adotante' ? (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-600 ml-1">Nome Completo</label>
                <input name="nome" value={formData.nome} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none" placeholder="Seu nome" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nascimento</label>
                <input name="nascimento" value={formData.nascimento} onChange={handleChange} type="date" className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 ml-1">CPF</label>
                <input name="cpf" value={formData.cpf} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none" placeholder="000.000.000-00" required />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nome da ONG</label>
                <input name="nomeOng" value={formData.nomeOng} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none" placeholder="Nome da instituição" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 ml-1">CNPJ</label>
                <input name="cnpj" value={formData.cnpj} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none" placeholder="00.000.000/0000-00" required />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 ml-1">E-mail</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none" placeholder="seu@email.com" required />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Senha</label>
            <input name="senha" value={formData.senha} onChange={handleChange} type="password"  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none" placeholder="••••••••" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Confirmar Senha</label>
            <input name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} type="password" className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none" placeholder="••••••••" required />
          </div>

          <div className="md:col-span-2 flex justify-center mt-6">
            <button type="submit" className="px-10 py-3 bg-[#6fe2f1] hover:bg-[#5bc8d6] text-slate-900 font-black rounded-2xl shadow-lg transition-all active:scale-95">
              FINALIZAR CADASTRO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;