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
import type { AdoptionRequestActionResult } from './models';
import { CreateAdoptionRequestDto } from './dto/create-adoption-request.dto';

export type { AdoptionRequestActionResult };

@Controller('adoption-requests')
export class AdoptionRequestsController {
  constructor(private readonly adoptionRequestsService: AdoptionRequestsService) {}

  @Get()
  @UseGuards(SessionGuard)
  async findAll(
    @Query('type') type: 'received' | 'sent' = 'received',
    @Query('responsibleUserId') responsibleUserId: string | undefined,
    @Query('adopterId') adopterId: string | undefined,
    @CurrentUser() user: MockUser | PublicUser,
  ) {
    if (type === 'sent') {
      return this.adoptionRequestsService.findSent(adopterId ?? user.id);
    }

    // default to received
    return this.adoptionRequestsService.findReceived(responsibleUserId ?? user.id);
  }
  @Post()
  @UseGuards(SessionGuard)
  async create(@Body() dto: CreateAdoptionRequestDto, @CurrentUser() user: MockUser | PublicUser) {
    return this.adoptionRequestsService.create(user.id, dto);
  }
  @Patch(':id')
  @UseGuards(SessionGuard)
  async manage(
    @Param('id') id: string,
    @Body() dto: ManageAdoptionRequestDto,
    @CurrentUser() user: MockUser | PublicUser,
  ) {
    return this.adoptionRequestsService.manageReceived(id, user.id, dto);
  }

  @Post('simulate')
  @UseGuards(SessionGuard)
  async simulate(
    @Body() dto: SimulateAdoptionRequestDto,
    @CurrentUser() user: MockUser | PublicUser,
  ) {
    return this.adoptionRequestsService.simulateReceived(user.id, dto);
  }
}
