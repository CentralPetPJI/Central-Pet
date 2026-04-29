import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SpeciesValues, SexValues, SizeValues } from '../constants';

export class UpdatePetDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  profilePhoto?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(5000, { each: true })
  galleryPhotos?: string[];

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  age?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsIn([...SpeciesValues])
  species?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  breed?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsIn([...SexValues])
  sex?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsIn([...SizeValues])
  size?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  microchipped?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsIn(['ONG', 'PESSOA_FISICA', 'ADMIN'])
  sourceType?: 'ONG' | 'PESSOA_FISICA' | 'ADMIN';

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  sourceName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  vaccinated?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  neutered?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  dewormed?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  needsHealthCare?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  physicalLimitation?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  visualLimitation?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  hearingLimitation?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  selectedPersonalities?: string[];
}
