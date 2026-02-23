import Footer from './Layout/Footer';
import Header from './Layout/Header';
import SidePanel from './Components/SidePanel';
import MainPage from './Pages/MainPage';
import petsData from '@/Models/Pet.tsx';

// TODO: Revisitar todos os css/tailwind e organizar melhor, tem muita coisa repetida e desnecessária talvez :)
const App: React.FC = () => {
  // TODO: Acho que seria melhor calcular esses counts no backend e passar como props para o frontend
  const dogCount = petsData.filter((pet) => pet.species === 'dog').length;
  const catCount = petsData.filter((pet) => pet.species === 'cat').length;
  const otherCount = petsData.filter(
    (pet) => pet.species !== 'dog' && pet.species !== 'cat',
  ).length;
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Layout principal */}
      <div
        className="
              pt-[11vh]
              grid
              grid-cols-1
              xl:grid-cols-[1fr_15%]
            "
      >
        {/* Conteúdo */}
        <main className="px-8 pb-12 overflow-hidden">
          <MainPage />
        </main>

        {/* Sidebar */}
        <aside className="hidden xl:block">
          {/* SidePanel dinâmico */}
          <SidePanel dogCount={dogCount} catCount={catCount} otherCount={otherCount} />
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default App;
