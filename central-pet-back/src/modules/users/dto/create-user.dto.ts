import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  @IsString()
  @IsIn(['PESSOA_FISICA', 'ONG'])
  role: 'PESSOA_FISICA' | 'ONG';

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'cpf must contain exactly 11 digits',
  })
  cpf?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  organizationName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/, {
    message: 'cnpj must contain exactly 14 digits',
  })
  cnpj?: string;
}
