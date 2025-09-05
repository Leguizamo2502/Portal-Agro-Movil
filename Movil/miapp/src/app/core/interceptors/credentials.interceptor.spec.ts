import { TestBed } from '@angular/core/testing';

import { CredentialsInterceptor } from './credentials.interceptor';

describe('CredentialsInterceptor', () => {
  let service: CredentialsInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CredentialsInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
