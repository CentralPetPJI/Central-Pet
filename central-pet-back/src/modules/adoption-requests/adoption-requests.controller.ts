import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { CreateAdoptionRequestDto } from './dto/create-adoption-request.dto';
import { AdoptionRequestsService } from './adoption-requests.service';

@Controller('adoption-requests')
export class AdoptionRequestsController {
  constructor(private readonly adoptionRequestsService: AdoptionRequestsService) {}

  @Post()
  create(@Body() createAdoptionRequestDto: CreateAdoptionRequestDto) {
    return this.adoptionRequestsService.create(createAdoptionRequestDto);
  }

  @Get()
  findReceived(@Query('type') type?: 'received' | 'sent', @Headers('x-user-id') userId?: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (type && type !== 'received') {
      throw new Error('Only "received" type is currently supported');
    }

    return this.adoptionRequestsService.findReceived(userId);
  }

  @Get('all')
  findAll() {
    return this.adoptionRequestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adoptionRequestsService.findOne(id);
  }
}
