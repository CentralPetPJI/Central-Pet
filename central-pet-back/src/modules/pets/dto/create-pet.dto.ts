import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['DOG', 'CAT'])
  species: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  breed?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    return Number(value);
  })
  @IsInt()
  @Min(0)
  ageMonths?: number;

  @IsOptional()
  @IsString()
  @IsIn(['SMALL', 'MEDIUM', 'LARGE'])
  size?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MALE', 'FEMALE'])
  sex?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  vaccinated?: boolean;

  @IsOptional()
  @IsBoolean()
  neutered?: boolean;

  @IsOptional()
  @IsBoolean()
  dewormed?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'IN_PROCESS', 'ADOPTED', 'UNAVAILABLE'])
  adoptionStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;

  @IsUUID()
  responsibleUserId: string;
}
