export interface User {
    _id?: string;
    username: string;
    email: string;
    password?: string;
    role: 'user' | 'institution';
    cpf?: string;
    cnpj?: string;
    createdAt?: Date;
    updatedAt?: Date;
}