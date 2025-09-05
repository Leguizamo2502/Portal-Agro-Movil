import { TestBed } from '@angular/core/testing';

import { RoleMatchGuard } from './role-match.guard';

describe('RoleMatchGuard', () => {
  let service: RoleMatchGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleMatchGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
