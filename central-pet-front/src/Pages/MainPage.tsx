import React from 'react';
import { Link } from 'react-router-dom';
import Carousel from '@/Components/Carousel';
import { routes } from '@/routes';
import { usePets } from '@/lib/pets';

const MainPage: React.FC = () => {
  const { pets, isLoading, error } = usePets();

  return (
    <section className="w-full px-1 pb-8 pt-4 lg:px-0 lg:pt-5">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Bem-vindo ao {import.meta.env.VITE_SITE_NAME ?? 'Centrau Pet'}!
      </h1>

      <p className="text-gray-600 mb-8">Confira os pets cadastrados recentemente:</p>

      <div className="mb-8 grid gap-4 rounded-3xl bg-linear-to-r from-cyan-100 via-white to-emerald-100 p-5 lg:p-6 2xl:grid-cols-[minmax(0,1fr)_auto_auto] 2xl:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Encontre ou cadastre um companheiro</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cadastre seu pet para adoção ou adote um novo amigo para levar para casa.
          </p>
        </div>
        <Link
          to={routes.pets.new.path}
          className="rounded-full bg-cyan-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-cyan-700"
        >
          Cadastrar pet
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-600">Carregando pets...</div>
      ) : error ? (
        <div className="text-center py-8 text-gray-600">
          Não foi possível conectar ao servidor para carregar os pets.
        </div>
      ) : null}

      <Carousel petsData={pets} />
    </section>
  );
};

export default MainPage;
