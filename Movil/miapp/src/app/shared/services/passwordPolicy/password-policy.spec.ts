import { TestBed } from '@angular/core/testing';

import { PasswordPolicy } from './password-policy';

describe('PasswordPolicy', () => {
  let service: PasswordPolicy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordPolicy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
