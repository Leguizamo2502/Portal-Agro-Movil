import { TestBed } from '@angular/core/testing';

import { Producer } from './producer';

describe('Producer', () => {
  let service: Producer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Producer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
