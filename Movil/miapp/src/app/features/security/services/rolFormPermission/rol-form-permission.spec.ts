import { TestBed } from '@angular/core/testing';

import { RolFormPermission } from './rol-form-permission';

describe('RolFormPermission', () => {
  let service: RolFormPermission;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolFormPermission);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
