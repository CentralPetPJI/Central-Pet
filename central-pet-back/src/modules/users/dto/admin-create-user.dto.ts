import { IsIn, IsOptional, IsBoolean } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class AdminCreateUserDto extends CreateUserDto {
  @IsOptional()
  @IsIn(['ADMIN', 'PESSOA_FISICA', 'ONG'])
  roleOverride?: 'ADMIN' | 'PESSOA_FISICA' | 'ONG';

  @IsOptional()
  @IsBoolean()
  mustChangePassword?: boolean;
}
