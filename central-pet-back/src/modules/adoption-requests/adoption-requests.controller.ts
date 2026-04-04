import { Controller, Get, Headers, Query } from '@nestjs/common';
import { AdoptionRequestsService } from './adoption-requests.service';

@Controller('adoption-requests')
export class AdoptionRequestsController {
  constructor(private readonly adoptionRequestsService: AdoptionRequestsService) {}

  @Get()
  findAll(@Query('type') type?: 'received' | 'sent', @Headers('x-user-id') userId?: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (type && type !== 'received') {
      throw new Error('Only "received" type is currently supported');
    }

    return this.adoptionRequestsService.findReceived(userId);
  }
}
