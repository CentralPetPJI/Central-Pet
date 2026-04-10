import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const manageAdoptionRequestActions = ['approve', 'share_contact', 'reject'] as const;

export type ManageAdoptionRequestAction = (typeof manageAdoptionRequestActions)[number];

export class ManageAdoptionRequestDto {
  @IsString()
  @IsIn(manageAdoptionRequestActions)
  @IsNotEmpty()
  action: ManageAdoptionRequestAction;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  note?: string;
}
