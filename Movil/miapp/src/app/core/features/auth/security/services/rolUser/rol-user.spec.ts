import { TestBed } from '@angular/core/testing';

import { RolUser } from './rol-user';

describe('RolUser', () => {
  let service: RolUser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
