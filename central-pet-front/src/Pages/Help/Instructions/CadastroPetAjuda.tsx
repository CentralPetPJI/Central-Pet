import "./CadastroPetAjuda.css";

const CadastroPetAjuda = () => {
  return (
    <div className="pet-register-container">
      <h2 className="titulo">Como Cadastrar Pets</h2>
      <div className="info-section">
        <p className="info">
          Para cadastrar pets na plataforma, é necessário antes realizar o
          login, com suas credenciais cadastradas.
        </p>
        <p className="info">
          Acesse a página de cadastro pelo menu "Pets - Cadastrar" ou, se
          estiver em um dispositivo móvel, acesse no menu superior (localizado
          abaixo do cabeçalho da página) a opção "Cadastrar Pets".
        </p>
        <p className="info">
          Na página de cadastro de pet, temos as seguintes informações para
          inserir:
        </p>
        <ul className="outer-list">
          <li>
            <span className="fieldname">Nome</span> ou{" "}
            <span className="fieldname">Apelido</span> do pet -{" "}
            <span className="obrigatorio">Obrigatório</span>
          </li>
          <li>
            <span className="fieldname">Espécie</span> do pet -{" "}
            <span className="obrigatorio">Obrigatório</span>
            <ul className="inner-list">
              <li>
                <span className="species">Canina</span> para cães
              </li>
              <li>
                <span className="species">Felina</span> para gatos
              </li>
              <li>
                <span className="species">Outra</span> para pets que não sejam
                cães nem gatos (ex.: pássaros, hamsters, morcegos, lagartos,
                sapos, etc.)
              </li>
            </ul>
          </li>
          <li>
            <span className="fieldname">Características Físicas</span> do pet
            (ex.: cor dos pêlos, sem pêlos, orelhas grandes, etc.) -{" "}
            <span className="obrigatorio">Obrigatório</span>
          </li>
          <li>
            <span className="fieldname">Características Comportamentais</span>{" "}
            do pet (ex.: agitado, calmo, carente, gosta de crianças, brincalhão,
            etc.)
          </li>
          <li>
            <span className="fieldname">Observações</span> sobre o pet (ex.:
            toma medicações, precisa de cuidados especiais, etc.)
          </li>
          <li>
            <span className="fieldname">Fotos</span> do pet (até 3 fotos,
            dependendo do tamanho dos arquivos)
          </li>
          <li>
            <span className="fieldname">Situação</span> do pet (se o pet está
            disponível para adoção ou não)
          </li>
        </ul>
        <p>
          Após a inserção das informações obrigatórias é possível pressionar o
          botão "Cadastrar" para finalizar o cadastro.
        </p>
        <p>
          Caso não ocorra nenhum erro no cadastro do pet, uma tela de
          confirmação será exibida e o pet estará disponível para busca no
          aplicativo.
        </p>
      </div>
    </div>
  );
};

export default CadastroPetAjuda;
