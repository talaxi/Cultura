import { TestBed } from '@angular/core/testing';

import { GrandPrixLogicService } from './grand-prix-logic.service';

describe('GrandPrixLogicService', () => {
  let service: GrandPrixLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrandPrixLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
