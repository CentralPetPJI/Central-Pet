import { Injectable, UnauthorizedException } from '@nestjs/common';
import { mockUsers, defaultMockUserId, type MockUser } from '../../mocks/users.mock';

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

  getCurrentUser(mockUserId?: string) {
    if (!mockUserId) {
      throw new UnauthorizedException('Invalid or missing mock credentials');
    }

    const userId = mockUserId;
    const user = this.mockUsers.find((item) => item.id === userId);

    if (!user) {
      throw new UnauthorizedException('Invalid or missing mock credentials');
    }

    return {
      message: 'Authenticated mock user retrieved successfully',
      data: {
        user,
      },
    };
  }
}
