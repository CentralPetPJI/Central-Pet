import { IsIn } from 'class-validator';

export class SetAuthModeDto {
  @IsIn(['jwt', 'mock'])
  mode!: 'jwt' | 'mock';
}
