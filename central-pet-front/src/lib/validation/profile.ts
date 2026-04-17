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
  organizationName: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.url('Website deve ser um link válido.').optional().or(z.literal('')),
  foundedAt: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const d = new Date(date);
      return !isNaN(d.getTime()) && d <= new Date();
    }, 'Data de fundação não pode ser no futuro.'),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
