import React from 'react';
import { Link } from 'react-router-dom';
import Carousel from '@/Components/Carousel';
import { getStoredPets } from '@/storage/pets';
import { routes } from '@/routes';

const MainPage: React.FC = () => {
  const petsData = getStoredPets();

  return (
    <section className="w-full px-1 pb-8 pt-4 lg:px-0 lg:pt-5">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo ao Pet Central!</h1>

      <p className="text-gray-600 mb-8">Confira os pets cadastrados recentemente:</p>

      <div className="mb-8 grid gap-4 rounded-3xl bg-linear-to-r from-cyan-100 via-white to-emerald-100 p-5 lg:p-6 2xl:grid-cols-[minmax(0,1fr)_auto_auto] 2xl:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fluxo de doacao e adocao</h2>
          <p className="mt-1 text-sm text-slate-600">
            A pessoa física cadastra o pet com todas as informacoes. A ONG visualiza o perfil
            completo do animal antes de decidir.
          </p>
        </div>
        <Link
          to={routes.pets.new.path}
          className="rounded-full bg-cyan-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-cyan-700"
        >
          Cadastrar pet
        </Link>
      </div>

      <Carousel petsData={petsData} />
    </section>
  );
};

export default MainPage;
