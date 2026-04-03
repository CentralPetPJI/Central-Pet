import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { SpeciesValues, SexValues, SizeValues } from '../constants';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  profilePhoto: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(5000, { each: true })
  galleryPhotos?: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  age: string;

  @IsString()
  @IsIn([...SpeciesValues])
  species: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  breed: string;

  @IsString()
  @IsIn([...SexValues])
  sex: string;

  @IsString()
  @IsIn([...SizeValues])
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

  @IsString()
  @IsNotEmpty()
  responsibleUserId: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  selectedPersonalities?: string[];
}
