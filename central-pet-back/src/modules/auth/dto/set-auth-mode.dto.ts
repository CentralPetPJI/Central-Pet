import { IsIn } from 'class-validator';

export class SetAuthModeDto {
  @IsIn(['session', 'mock'])
  mode!: 'session' | 'mock';
}
