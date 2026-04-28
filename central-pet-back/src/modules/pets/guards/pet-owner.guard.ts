import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PetsService } from '../pets.service';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

@Injectable()
export class PetOwnerGuard implements CanActivate {
  constructor(private readonly petsService: PetsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const petId = request.params.id;

    if (!user?.id) {
      throw new ForbiddenException('Usuário não autenticado ou ID ausente');
    }

    if (!petId) {
      return true; // Se não houver ID na rota, deixa passar (ex: criação)
    }

    // Garantir que petId seja string (caso venha como array por erro de rota)
    const normalizedPetId = Array.isArray(petId) ? petId[0] : petId;

    try {
      const response = await this.petsService.findOne(normalizedPetId);
      const pet = response.data;

      if (pet.responsibleUserId !== user.id) {
        throw new ForbiddenException('Você não tem permissão para gerenciar este pet');
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ForbiddenException('Erro ao verificar a posse do pet');
    }
  }
}
