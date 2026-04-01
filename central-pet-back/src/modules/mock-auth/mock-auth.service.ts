import { Injectable, NotFoundException } from '@nestjs/common';
import {
  mockUsers,
  defaultMockUserId,
  type MockUser,
} from '../../mocks/users.mock';

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
      throw new NotFoundException('Mock user not selected');
    }

    const userId = mockUserId;
    const user = this.mockUsers.find((item) => item.id === userId);

    if (!user) {
      throw new NotFoundException(`Mock user with id "${userId}" not found`);
    }

    return {
      message: 'Authenticated mock user retrieved successfully',
      data: {
        user,
      },
    };
  }
}
