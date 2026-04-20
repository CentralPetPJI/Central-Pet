import { IsString, IsOptional, MaxLength, IsDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === '') return null;
    return value as Date | null;
  })
  @IsDate()
  birthDate?: Date | null;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobile?: string;
}
