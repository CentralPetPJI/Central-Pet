import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAdoptionRequestDto {
  @IsUUID()
  petId: string;

  @IsUUID()
  requesterId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
