import { IsNotEmpty, IsString } from 'class-validator';

export class SelectMockUserDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
