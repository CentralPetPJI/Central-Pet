import { IsString, IsOptional, IsEmail, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInstitutionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @Transform(({ value }: { value: unknown }) => {
    if (value === '') return null;
    return value;
  })
  @IsOptional()
  cnpj?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  facebook?: string;

  @IsString()
  @IsOptional()
  website?: string | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === '') return null;
    return value as Date | null;
  })
  foundedAt?: Date;

  @IsString()
  @IsOptional()
  verificationLinks?: string;
}

export class UpdateInstitutionDto extends CreateInstitutionDto {}
