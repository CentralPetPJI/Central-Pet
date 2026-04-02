import { Controller, Get, Headers, Query } from '@nestjs/common';
import { AdoptionRequestsService } from './adoption-requests.service';

@Controller('adoption-requests')
export class AdoptionRequestsController {
  constructor(private readonly adoptionRequestsService: AdoptionRequestsService) {}

  @Get()
  findAll(
    @Query('type') type?: 'received' | 'sent',
    @Query('responsibleUserId') responsibleUserId?: string,
    @Headers('x-mock-user-id') mockUserId?: string,
  ) {
    // type=received usa o novo endpoint RESTful
    // Manter backward compatibility mantendo responsibleUserId como filtro principal
    const userId = responsibleUserId ?? mockUserId;

    if (type === 'received') {
      return this.adoptionRequestsService.findReceived(userId);
    }

    // Para outros tipos ou sem filtro, listar tudo (futura expansão)
    return this.adoptionRequestsService.findReceived(userId);
  }
}
