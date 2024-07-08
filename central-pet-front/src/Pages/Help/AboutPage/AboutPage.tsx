import React from "react";
import "./AboutPage.css";

const AboutPage: React.FC = () => {
  return (
    <div className="about-container">
      <h2 className="titulo">Sobre a Central Pet</h2>
      <div className="info-section">
        <p className="info">
          Esta aplicação foi desenvolvida com o intuito de auxiliar e facilitar
          a comunicação entre pessoas e instituições engajadas em ajudar no
          processo de adoção de animais de estimação.
        </p>
        <p className="info">
          Aqui será possível cadastrar pets que se encontrem em situação de
          abandono ou maus tratos, ou simplesmente que estejam disponíveis para
          adoção.
        </p>
        <p className="info">
          É possível também utilizar a aplicação para divulgação dos seus pets,
          postando fotos de cada um deles apenas para mostrar o quão
          maravilhosos eles são.
        </p>
        <p className="info">
          A aplicação foi desenvolvida apenas por um desenvolvedor em processo
          de aprimoramento de suas habilidades de desenvolvimento de software,
          por isso é possível que existam erros ou alguns problemas no
          funcionamento da mesma. Em caso de constatação de qualquer tipo de
          erro, peço que entre em contato comigo pelo email
          <span className="contact"> guilhermefsaito@gmail.com</span> para que o
          erro ou problema possa ser corrigido o quanto antes.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
