import { Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { mockUsers, defaultMockUserId, type MockUser } from '@/mocks';
import { NotProductionGuard } from '@/modules/mock-auth/guards/not-production.guard';

@Injectable()
export class MockAuthService {
  private readonly mockUsers: MockUser[] = [...mockUsers];
  private readonly defaultUserId = defaultMockUserId;

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
    const userIndex = this.mockUsers.findIndex((item) => item.id === userId);

    if (userIndex === -1) {
      throw new UnauthorizedException('Invalid or missing user credentials');
    }

    this.mockUsers[userIndex].acceptedTermsAt = new Date();
    return {
      message: 'Terms accepted successfully',
      data: {
        user: this.mockUsers[userIndex],
      },
    };
  }
}
