import { TestBed } from '@angular/core/testing';

import { Unauthorized } from './unauthorized';

describe('Unauthorized', () => {
  let service: Unauthorized;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Unauthorized);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
