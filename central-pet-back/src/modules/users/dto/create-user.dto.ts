import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsDate()
  @Type(() => Date)
  birthDate?: Date;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9]{11}$/, {
    message: 'cpf must contain exactly 11 alphanumeric characters',
  })
  cpf?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  organizationName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9]{14}$/, {
    message: 'cnpj must contain exactly 14 alphanumeric characters',
  })
  cnpj?: string;
}
