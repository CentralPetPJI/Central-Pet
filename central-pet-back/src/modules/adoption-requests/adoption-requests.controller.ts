import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common';
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
      throw new UnauthorizedException('User ID is required');
    }

    if (type && type !== 'received') {
      throw new BadRequestException('Only "received" type is currently supported');
    }

    return this.adoptionRequestsService.findReceived(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adoptionRequestsService.findOne(id);
  }
}
