import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user?: { id: string };
}

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Get()
  findAll(@Query('responsibleUserId') responsibleUserId?: string) {
    return this.petsService.findAll(responsibleUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  @UseGuards(SessionGuard)
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const requesterId = req.user?.id;
    if (!requesterId) {
      throw new ForbiddenException('User ID not found in session');
    }
    return this.petsService.remove(id, requesterId);
  }
}
