import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAdoptionRequestDto {
  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsBoolean()
  adopterContactShareConsent: boolean;
}
