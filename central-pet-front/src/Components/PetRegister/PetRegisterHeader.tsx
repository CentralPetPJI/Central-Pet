interface PetRegisterHeaderProps {
  isEditMode: boolean;
}

const PetRegisterHeader = ({ isEditMode }: PetRegisterHeaderProps) => (
  <div className="max-w-4xl">
    <span className="inline-flex rounded-full bg-white/80 px-4 py-1 text-sm font-medium text-cyan-900">
      {isEditMode ? 'Edição do cadastro' : 'Fluxo da pessoa física'}
    </span>
    <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">
      {isEditMode ? 'Edite o cadastro do pet' : 'Cadastre o pet para adoção'}
    </h1>
    <p className="mt-2 text-sm leading-6 text-slate-600 lg:text-base">
      Preencha as informações que serão exibidas para pessoas físicas no perfil do pet.
    </p>
  </div>
);

export default PetRegisterHeader;
