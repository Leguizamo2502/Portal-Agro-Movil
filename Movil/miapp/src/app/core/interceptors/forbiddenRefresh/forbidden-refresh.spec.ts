import { TestBed } from '@angular/core/testing';

import { ForbiddenRefresh } from './forbidden-refresh';

describe('ForbiddenRefresh', () => {
  let service: ForbiddenRefresh;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForbiddenRefresh);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
