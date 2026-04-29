import { z } from 'zod';
import { petSpeciesOptions, petSexOptions, petSizeOptions } from '@/lib/formatters';
import { isPetAgeCategory, petAgeCategoryOptions } from '@/lib/pet-age';

export const petRegisterStorageKey = 'central-pet:register-form';

export const petRegisterFormSchema = z.object({
  profilePhoto: z.string('Insira a foto de perfil do pet.'),
  galleryPhotos: z.array(z.string()).optional(),
  name: z.string().trim().min(1, 'Informe o nome do pet antes de salvar.'),
  age: z
    .string()
    .trim()
    .min(1, 'Selecione a faixa etaria do pet.')
    .refine((value) => isPetAgeCategory(value), 'Selecione uma faixa etaria valida.'),
  species: z.enum(['dog', 'cat'], { error: 'Selecione uma especie valida.' }),
  breed: z.string().trim().min(1, 'Informe a raca do pet.'),
  sex: z.enum(['male', 'female'], { error: 'Selecione um sexo valido.' }),
  size: z.enum(['small', 'medium', 'large'], { error: 'Selecione um porte valido.' }),
  microchipped: z.boolean(),
  vaccinated: z.boolean(),
  neutered: z.boolean(),
  dewormed: z.boolean(),
  needsHealthCare: z.boolean(),
  physicalLimitation: z.boolean(),
  visualLimitation: z.boolean(),
  hearingLimitation: z.boolean(),
});

type PetRegisterFormSchemaData = z.infer<typeof petRegisterFormSchema>;

export type PetRegisterFormData = PetRegisterFormSchemaData;

export const isPetRegisterFormDataLike = (data: unknown): data is Partial<PetRegisterFormData> =>
  typeof data === 'object' && data !== null && !Array.isArray(data);

// Re-exportamos as opções para manter a compatibilidade com os componentes que importam de '@/storage/pets'
export { petAgeCategoryOptions, petSpeciesOptions, petSexOptions, petSizeOptions };
