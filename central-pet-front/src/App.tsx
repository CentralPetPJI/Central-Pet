import React from 'react';
import { useMemo } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import SidePanel from '@/Components/SidePanel';
import { MockUserChoiceGate } from '@/Components/Auth/MockUserChoiceGate';
import Footer from '@/Layout/Footer';
import Header from '@/Layout/Header';
import { routes } from '@/routes';
import { shouldDisplayMockChoiceGates } from '@/lib/dev-mode.ts';
import { usePets } from '@/lib/pets';

const App: React.FC = () => {
  const location = useLocation();
  const { pets } = usePets();
  const speciesCounts = useMemo(
    () =>
      pets.reduce<Record<string, number>>((counts, pet) => {
        counts[pet.species] = (counts[pet.species] ?? 0) + 1;
        return counts;
      }, {}),
    [pets],
  );

  const routedContent = useRoutes([
    routes.home,
    routes.login,
    routes.register,
    routes.profile,
    routes.institutions.list,
    routes.institutions.detail,
    routes.pets.new,
    routes.pets.mine,
    routes.pets.edit,
    routes.pets.detail,
    routes.adoptionRequests.received,
  ]);
  const showSidePanel = location.pathname === routes.home.path;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      {shouldDisplayMockChoiceGates() ? <MockUserChoiceGate /> : null}

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
