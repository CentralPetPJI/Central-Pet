import { z } from 'zod';

export const userProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Nome completo é obrigatório.'),
  birthDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      return !isNaN(birthDate.getTime()) && birthDate <= new Date();
    }, 'Data de nascimento não pode ser no futuro.'),
  city: z.string().trim().min(1, 'Cidade é obrigatória.'),
  state: z.string().min(1, 'Estado é obrigatório.'),
  phone: z.string().optional(),
  mobile: z.string().optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
