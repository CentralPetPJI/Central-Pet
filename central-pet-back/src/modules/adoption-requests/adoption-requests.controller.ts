import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { SessionGuard } from '@/modules/auth/guards/session.guard';
import type { MockUser } from '@/mocks';
import type { PublicUser } from '@/modules/users/users.service';
import { AdoptionRequestsService } from './adoption-requests.service';
import { ManageAdoptionRequestDto } from './dto/manage-adoption-request.dto';
import { SimulateAdoptionRequestDto } from './dto/simulate-adoption-request.dto';

@Controller('adoption-requests')
export class AdoptionRequestsController {
  constructor(private readonly adoptionRequestsService: AdoptionRequestsService) {}

  @Get()
  @UseGuards(SessionGuard)
  findAll(@CurrentUser() user: MockUser | PublicUser, @Query('type') type?: 'received' | 'sent') {
    if (type && type !== 'received') {
      throw new BadRequestException('Only "received" type is currently supported');
    }

    return this.adoptionRequestsService.findReceived(user.id);
  }

  @Patch(':id')
  @UseGuards(SessionGuard)
  manage(
    @Param('id') id: string,
    @Body() dto: ManageAdoptionRequestDto,
    @CurrentUser() user: MockUser | PublicUser,
  ) {
    return this.adoptionRequestsService.manageReceived(id, user.id, dto);
  }

  @Post('simulate')
  @UseGuards(SessionGuard)
  simulate(@Body() dto: SimulateAdoptionRequestDto, @CurrentUser() user: MockUser | PublicUser) {
    return this.adoptionRequestsService.simulateReceived(user.id, dto);
  }
}
