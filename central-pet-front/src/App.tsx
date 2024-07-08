import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./Layout/Layout";
import MainPage from "@/Pages/MainPage";
import RegisterPage from "@/Pages/RegisterPage/RegisterPage";
import LoginPage from "@/Pages/LoginPage/LoginPage";
import NotFoundPage from "@/Pages/NotFoundPage/NotFoundPage";
import AboutPage from "@/Pages/Help/AboutPage/AboutPage";
import "@/styles/global.css";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <MainPage />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <RegisterPage />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <LoginPage />
            </Layout>
          }
        />
        {/* <Route
          path="/instructions"
          Component={() => (
            <Layout>
              <Instructions />
            </Layout>
          )}
        /> */}
        <Route
          path="/about"
          element={
            <Layout>
              <AboutPage />
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <NotFoundPage />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
