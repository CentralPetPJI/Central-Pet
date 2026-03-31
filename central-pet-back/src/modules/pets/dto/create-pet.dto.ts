import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  profilePhoto: string;

  @IsArray()
  @IsString({ each: true })
  galleryPhotos: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  age: string;

  @IsString()
  @IsIn(['dog', 'cat'])
  species: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  breed: string;

  @IsString()
  @IsIn(['Femea', 'Macho'])
  sex: string;

  @IsString()
  @IsIn(['Pequeno', 'Medio', 'Grande'])
  size: string;

  @IsBoolean()
  microchipped: boolean;

  @IsString()
  @IsNotEmpty()
  tutor: string;

  @IsString()
  @IsNotEmpty()
  shelter: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  contact: string;

  @IsBoolean()
  vaccinated: boolean;

  @IsBoolean()
  neutered: boolean;

  @IsBoolean()
  dewormed: boolean;

  @IsBoolean()
  needsHealthCare: boolean;

  @IsBoolean()
  physicalLimitation: boolean;

  @IsBoolean()
  visualLimitation: boolean;

  @IsBoolean()
  hearingLimitation: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  selectedPersonalities?: string[];
}
