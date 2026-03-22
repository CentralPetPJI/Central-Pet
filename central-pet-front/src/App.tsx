import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Layout/Header';
import { SidePanel } from './Components/SidePanel';
import MainPage from './Pages/MainPage';
import petsData from '@/Models/Pet.tsx';
import Login from './Pages/Login/Login';
import Register from './Pages/Register/Register';

const App: React.FC = () => {
  const counts = {
    dog: petsData.filter((pet) => pet.species === 'dog').length,
    cat: petsData.filter((pet) => pet.species === 'cat').length,
    other: petsData.filter((pet) => pet.species !== 'dog' && pet.species !== 'cat').length,
  };

  return (
    <Router>
      <Routes>
        {/* 1. Rotas "Limpas" (Sem Header/Sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 2. Rota Principal com o Layout Completo */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="pt-[11vh] grid grid-cols-1 xl:grid-cols-[1fr_15%]">
                <main className="px-8 pb-12 overflow-hidden">
                  <MainPage />
                </main>
                <aside className="hidden xl:block">
                  <SidePanel counts={counts} />
                </aside>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
