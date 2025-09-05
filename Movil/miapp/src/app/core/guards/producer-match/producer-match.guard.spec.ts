import { TestBed } from '@angular/core/testing';

import { ProducerMatch } from './producer-match.guard';

describe('ProducerMatch', () => {
  let service: ProducerMatch;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProducerMatch);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
