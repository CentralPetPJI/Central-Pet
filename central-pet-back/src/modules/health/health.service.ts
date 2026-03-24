import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'OK',
      service: 'central-pet-back',
      timestamp: new Date().toISOString(),
    };
  }
}
