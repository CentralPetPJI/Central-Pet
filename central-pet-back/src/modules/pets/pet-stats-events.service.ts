import { Injectable, type MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';

export const PET_STATS_CHANGED_EVENT = 'pet-stats-changed';

@Injectable()
export class PetStatsEventsService {
  private readonly changes = new Subject<MessageEvent>();

  events() {
    return this.changes.asObservable();
  }

  emitChanged() {
    this.changes.next({
      type: PET_STATS_CHANGED_EVENT,
      data: { type: PET_STATS_CHANGED_EVENT },
    });
  }
}
