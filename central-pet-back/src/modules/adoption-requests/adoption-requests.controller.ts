import { Controller, Get, Headers, Query } from '@nestjs/common';
import { AdoptionRequestsService } from './adoption-requests.service';

@Controller('adoption-requests')
export class AdoptionRequestsController {
  constructor(
    private readonly adoptionRequestsService: AdoptionRequestsService,
  ) {}

  @Get('received')
  findReceived(
    @Query('responsibleUserId') responsibleUserId?: string,
    @Headers('x-mock-user-id') mockUserId?: string,
  ) {
    return this.adoptionRequestsService.findReceived(
      responsibleUserId ?? mockUserId,
    );
  }
}
