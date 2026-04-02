import { beforeEach, describe, expect, it } from '@jest/globals';
import { mockUserIds } from '../../mocks/users.mock';
import { AdoptionRequestsService } from './adoption-requests.service';

describe('AdoptionRequestsService', () => {
  let service: AdoptionRequestsService;

  beforeEach(() => {
    service = new AdoptionRequestsService();
  });

  it('should return all received adoption requests sorted by most recent date', () => {
    const result = service.findReceived();

    expect(result.message).toBe('Received adoption requests retrieved successfully');
    expect(result.data).toHaveLength(4);

    // Verify list is sorted by date in descending order (most recent first)
    const timestamps = result.data.map((request) => new Date(request.requestedAt).getTime());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i - 1]);
    }
  });

  it('should filter adoption requests by responsible user id', () => {
    const result = service.findReceived(mockUserIds.ONG_PATAS_DO_CENTRO);

    expect(result.data).toHaveLength(2);
    expect(
      result.data.every(
        (request) => request.pet.responsibleUserId === mockUserIds.ONG_PATAS_DO_CENTRO,
      ),
    ).toBe(true);
  });

  it('should return requests for a pessoa fisica', () => {
    const result = service.findReceived(mockUserIds.JULIANA_MARTINS);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.pet.sourceType).toBe('PESSOA_FISICA');
    expect(result.data[0]?.pet.sourceName).toBe('Juliana Martins');
  });

  it('should return an empty list when there are no received adoption requests for the donor', () => {
    const result = service.findReceived('99999999-9999-9999-9999-999999999999');

    expect(result.data).toEqual([]);
  });
});
