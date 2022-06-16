import { TestBed } from '@angular/core/testing';

import { RaceLogicService } from './race-logic.service';

describe('RaceLogicService', () => {
  let service: RaceLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RaceLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
