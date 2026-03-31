import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdatePetDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  profilePhoto?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @IsString({ each: true })
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
  @IsIn(['dog', 'cat'])
  species?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  breed?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsIn(['Femea', 'Macho'])
  sex?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsIn(['Pequeno', 'Medio', 'Grande'])
  size?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  microchipped?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  tutor?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  shelter?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  city?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  contact?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
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
  selectedPersonalities?: string[];
}
