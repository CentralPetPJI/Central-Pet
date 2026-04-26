import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAdoptionRequestDto {
  @IsUUID()

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
