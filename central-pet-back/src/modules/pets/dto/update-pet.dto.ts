import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdatePetDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @IsIn(['DOG', 'CAT'])
  species?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(100)
  breed?: string;

  @ValidateIf((_, value) => value !== undefined)
  @Transform(({ value }) => {
    if (value === '') {
      return '__INVALID_EMPTY__';
    }

    if (value === undefined) {
      return undefined;
    }

    return Number(value);
  })
  @IsInt()
  @Min(0)
  ageMonths?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsIn(['SMALL', 'MEDIUM', 'LARGE'])
  size?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsIn(['MALE', 'FEMALE'])
  sex?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(50)
  color?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(1000)
  description?: string;

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
  @IsString()
  @IsIn(['AVAILABLE', 'IN_PROCESS', 'ADOPTED', 'UNAVAILABLE'])
  adoptionStatus?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(100)
  city?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(2)
  state?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsUUID()
  responsibleUserId?: string;
}
