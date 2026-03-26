import React from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import SidePanel from '@/Components/SidePanel';
import { getStoredPets } from '@/Mocks/PetsStorage';
import Footer from '@/Layout/Footer';
import Header from '@/Layout/Header';
import { routes } from '@/routes';

// TODO: Revisitar todos os css/tailwind e organizar melhor, tem muita coisa repetida e desnecessária talvez :)
const App: React.FC = () => {
  const location = useLocation();
  const petsData = getStoredPets();

  const speciesCounts = petsData.reduce<Record<string, number>>((counts, pet) => {
    counts[pet.species] = (counts[pet.species] ?? 0) + 1;
    return counts;
  }, {});

  const routedContent = useRoutes([
    routes.home,
    routes.pets.new,
    routes.pets.edit,
    routes.pets.detail,
  ]);
  const showSidePanel = location.pathname === routes.home.path;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <div className="flex-1">
        <div className="grid h-full w-full grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px]">
          <main className="overflow-hidden px-4 pb-10 lg:px-6">{routedContent}</main>

          {showSidePanel ? (
            <aside className="hidden xl:block">
              <SidePanel speciesCounts={speciesCounts} />
            </aside>
          ) : null}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default App;
