export interface Pet {
  id: number;
  name: string;
  species: string;
  physicalCharacteristics: string;
  behavioralCharacteristics: string;
  notes: string;
  photo: string;
}

export interface Photo {
  id: number;
  url: string;
  petId: number;
  note: string;
}
