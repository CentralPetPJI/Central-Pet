import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('E-mail é obrigatório'),
  password: z.string().min(8, 'Senha é obrigatória'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Nome completo é obrigatório'),
    email: z.email('E-mail é obrigatório e deve ser válido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    role: z.enum(['PESSOA_FISICA', 'ONG']),
    documentValue: z.string().min(1, 'Documento é obrigatório'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos de responsabilidade',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
