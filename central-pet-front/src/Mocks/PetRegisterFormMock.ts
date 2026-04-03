import { z } from 'zod';
import dogImage from '../assets/image/dog.png';

export const petRegisterStorageKey = 'central-pet:register-form';

export interface PetRegisterFormData {
  profilePhoto: string;
  galleryPhotos: string[];
  name: string;
  age: string;
  species: string;
  breed: string;
  sex: string;
  size: string;
  microchipped: boolean;
  tutor: string;
  shelter: string;
  city: string;
  state: string;
  contact: string;
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  needsHealthCare: boolean;
  physicalLimitation: boolean;
  visualLimitation: boolean;
  hearingLimitation: boolean;
}

export const petRegisterFormSchema = z.object({
  profilePhoto: z.string().min(1, 'Adicione a foto de perfil do pet antes de salvar.'),
  galleryPhotos: z.array(z.string()),
  name: z.string().trim().min(1, 'Informe o nome do pet antes de salvar.'),
  age: z.string().trim().min(1, 'Informe a idade do pet.'),
  species: z.enum(['dog', 'cat'], { error: 'Selecione uma especie valida.' }),
  breed: z.string().trim().min(1, 'Informe a raca do pet.'),
  sex: z.enum(['Femea', 'Macho'], { error: 'Selecione um sexo valido.' }),
  size: z.enum(['Pequeno', 'Medio', 'Grande'], { error: 'Selecione um porte valido.' }),
  microchipped: z.boolean(),
  tutor: z.string().trim().min(1, 'Informe o tutor responsavel.'),
  shelter: z.string().trim().min(1, 'Informe o abrigo ou origem do pet.'),
  city: z.string().trim().min(1, 'Informe a cidade do pet.'),
  state: z.string().trim().min(1, 'Informe o estado (UF) do pet.'),
  contact: z.string().trim().min(1, 'Informe um contato para adocao.'),
  vaccinated: z.boolean(),
  neutered: z.boolean(),
  dewormed: z.boolean(),
  needsHealthCare: z.boolean(),
  physicalLimitation: z.boolean(),
  visualLimitation: z.boolean(),
  hearingLimitation: z.boolean(),
});

export const normalizePetRegisterFormData = (
  data: Partial<PetRegisterFormData>,
): PetRegisterFormData => ({
  ...initialPetRegisterFormData,
  ...data,
  profilePhoto: data.profilePhoto || initialPetRegisterFormData.profilePhoto,
  galleryPhotos: Array.isArray(data.galleryPhotos) ? data.galleryPhotos : [],
});

export const isPetRegisterFormDataLike = (data: unknown): data is Partial<PetRegisterFormData> =>
  typeof data === 'object' && data !== null && !Array.isArray(data);

export const initialPetRegisterFormData: PetRegisterFormData = {
  profilePhoto: dogImage,
  galleryPhotos: [],
  name: 'Luna',
  age: '3 anos',
  species: 'dog',
  breed: 'SRD',
  sex: 'Femea',
  size: 'Medio',
  microchipped: true,
  tutor: 'ONG Patas do Centro',
  shelter: 'Abrigo Reencontro',
  city: 'Sao Paulo',
  state: 'SP',
  contact: '(11) 99999-0000',
  vaccinated: true,
  neutered: true,
  dewormed: true,
  needsHealthCare: false,
  physicalLimitation: false,
  visualLimitation: false,
  hearingLimitation: false,
};

export const petSpeciesOptions = [
  { value: 'dog', label: 'Cachorro' },
  { value: 'cat', label: 'Gato' },
];
export const petSexOptions = ['Femea', 'Macho'];
export const petSizeOptions = ['Pequeno', 'Medio', 'Grande'];
