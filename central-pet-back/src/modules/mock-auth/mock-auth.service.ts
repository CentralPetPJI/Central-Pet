import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { mockUsers, defaultMockUserId, type MockUser } from '@/mocks';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MockAuthService {
  private readonly mockUsers: MockUser[] = [...mockUsers];
  private readonly defaultUserId = defaultMockUserId;

  constructor(private readonly configService: ConfigService) {}

  listUsers() {
    return {
      message: 'Mock users retrieved successfully',
      data: {
        users: this.mockUsers,
        defaultUserId: this.defaultUserId,
      },
    };
  }

  getCurrentUser(userId?: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid or missing user credentials');
    }

    const user = this.mockUsers.find((item) => item.id === userId);

    if (!user) {
      throw new UnauthorizedException('Invalid or missing user credentials');
    }

    return {
      message: 'Authenticated user retrieved successfully',
      data: {
        user,
      },
    };
  }

  acceptTerms(userId: string) {
    const targetVersion = this.configService.get<string>('TERMS_VERSION');

    const userIndex = this.mockUsers.findIndex((item) => item.id === userId);

    if (userIndex === -1) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (this.mockUsers[userIndex].acceptedTermsVersion === targetVersion) {
      throw new BadRequestException(`Esta versão dos termos (${targetVersion}) já foi aceita`);
    }

    this.mockUsers[userIndex] = {
      ...this.mockUsers[userIndex],
      acceptedTermsAt: new Date(),
      acceptedTermsVersion: targetVersion,
    };

    return {
      message: 'Termos aceitos com sucesso',
      data: {
        user: this.mockUsers[userIndex],
      },
    };
  }
}
