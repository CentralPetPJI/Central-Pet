import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SelectMockUserDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}
