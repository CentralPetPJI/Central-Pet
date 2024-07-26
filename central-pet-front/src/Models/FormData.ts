export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: "user" | "institution";
  cpf?: string;
  cnpj?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}
