import { z } from 'zod';

export const petRegisterStorageKey = 'central-pet:register-form';

export const petRegisterFormSchema = z.object({
  profilePhoto: z.string('Insira a foto de perfil do pet.'),
  galleryPhotos: z.array(z.string()).optional(),
  name: z.string().trim().min(1, 'Informe o nome do pet antes de salvar.'),
  age: z.string().trim().min(1, 'Informe a idade do pet.'),
  species: z.enum(['dog', 'cat'], { error: 'Selecione uma especie valida.' }),
  breed: z.string().trim().min(1, 'Informe a raca do pet.'),
  sex: z.enum(['male', 'female'], { error: 'Selecione um sexo valido.' }),
  size: z.enum(['small', 'medium', 'large'], { error: 'Selecione um porte valido.' }),
  microchipped: z.boolean(),
  tutor: z.string().trim().min(1, 'Informe o tutor responsavel.'),
  shelter: z.string().trim().min(1, 'Informe o abrigo ou origem do pet.'),
  city: z.string().trim().optional().default(''),
  state: z.string().trim().optional().default(''),
  contact: z.string().trim().min(1, 'Informe um contato para adocao.'),
  vaccinated: z.boolean(),
  neutered: z.boolean(),
  dewormed: z.boolean(),
  needsHealthCare: z.boolean(),
  physicalLimitation: z.boolean(),
  visualLimitation: z.boolean(),
  hearingLimitation: z.boolean(),
});

export type PetRegisterFormData = z.infer<typeof petRegisterFormSchema>;

export const isPetRegisterFormDataLike = (data: unknown): data is Partial<PetRegisterFormData> =>
  typeof data === 'object' && data !== null && !Array.isArray(data);

export const petSpeciesOptions = [
  { value: 'dog', label: 'Cachorro' },
  { value: 'cat', label: 'Gato' },
];
export const petSexOptions = [
  { value: 'female', label: 'Fêmea' },
  { value: 'male', label: 'Macho' },
];
export const petSizeOptions = [
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
];
