import { beforeEach, describe, expect, it } from '@jest/globals';
import { mockUserIds } from '../../mocks/users.mock';
import { AdoptionRequestsService } from './adoption-requests.service';

describe('Servico de solicitacoes de adocao', () => {
  let service: AdoptionRequestsService;

  beforeEach(() => {
    service = new AdoptionRequestsService();
  });

  it('deve retornar todas as solicitacoes recebidas ordenadas da mais recente para a mais antiga', () => {
    const result = service.findReceived();

    expect(result.message).toBe('Received adoption requests retrieved successfully');
    expect(result.data).toHaveLength(4);

    // Verifica se a lista está ordenada por data em ordem decrescente (mais recente primeiro)
    const timestamps = result.data.map((request) => new Date(request.requestedAt).getTime());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i - 1]);
    }
  });

  it('deve filtrar solicitacoes de adocao por id do usuario responsavel', () => {
    const result = service.findReceived(mockUserIds.ONG_PATAS_DO_CENTRO);

    expect(result.data).toHaveLength(2);
    expect(
      result.data.every(
        (request) => request.pet.responsibleUserId === mockUserIds.ONG_PATAS_DO_CENTRO,
      ),
    ).toBe(true);
  });

  it('deve retornar solicitacoes para uma pessoa fisica', () => {
    const result = service.findReceived(mockUserIds.JULIANA_MARTINS);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.pet.sourceType).toBe('PESSOA_FISICA');
    expect(result.data[0]?.pet.sourceName).toBe('Juliana Martins');
  });

  it('deve retornar lista vazia quando nao houver solicitacoes recebidas para o usuario', () => {
    const result = service.findReceived('99999999-9999-9999-9999-999999999999');

    expect(result.data).toEqual([]);
  });
});
