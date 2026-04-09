import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

type AdoptionRequestStatusType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export class CreateAdoptionRequestDto {
  @IsUUID()
  petId: string;

  @IsUUID()
  requesterId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsString()
  @IsIn([])
  status?: AdoptionRequestStatusType;
}
