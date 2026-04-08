import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePetHistoryDto {
  @IsUUID()
  petId: string;

  @IsString()
  @IsIn(['CREATED', 'TRANSFERRED', 'ADOPTION_APPROVED', 'RETURNED', 'UPDATED'])
  eventType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromResponsible?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  toResponsible?: string;

  @IsOptional()
  @IsUUID()
  performedByUserId?: string;
}
