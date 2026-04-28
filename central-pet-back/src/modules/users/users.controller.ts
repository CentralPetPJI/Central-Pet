import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import type { PublicUser } from './users.service';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { MockUser } from '@/mocks';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  getProfile(@CurrentUser() user: PublicUser | MockUser) {
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }
    return this.usersService.findProfileById(user.id);
  }

  @Patch('me')
  @UseGuards(SessionGuard)
  updateProfile(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user: PublicUser | MockUser) {
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }
    return this.usersService.update(user.id, updateUserDto);
  }

  @Patch('me/password')
  @UseGuards(SessionGuard)
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() user: PublicUser | MockUser,
  ) {
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }
    if (user.role != 'ADMIN') {
      throw new UnauthorizedException('Essa função está disponível apenas para administradores');
    }
    return this.usersService.updatePassword(user.id, updatePasswordDto);
  }

  @Post('me/deactivate')
  @UseGuards(SessionGuard)
  deactivateProfile(@CurrentUser() user: PublicUser | MockUser) {
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }
    return this.usersService.deactivate(user.id);
  }

  @Delete('me')
  @UseGuards(SessionGuard)
  deleteProfile(@CurrentUser() user: PublicUser | MockUser) {
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }
    return this.usersService.deactivate(user.id);
  }
}
