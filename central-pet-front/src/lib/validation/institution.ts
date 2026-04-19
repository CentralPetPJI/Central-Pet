import { z } from 'zod';

export const institutionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  description: z.string().optional(),
  cnpj: z
    .string()
    .optional()
    .refine((val) => !val || val.replace(/\D/g, '').length === 14, 'CNPJ deve conter 14 dígitos.'),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.url('URL inválida.').optional().or(z.literal('')),
  foundedAt: z.string().optional(),
});

export type InstitutionFormData = z.infer<typeof institutionSchema>;
