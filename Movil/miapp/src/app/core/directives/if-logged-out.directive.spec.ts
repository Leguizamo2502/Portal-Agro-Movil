import { TestBed } from '@angular/core/testing';

import { IfLoggedOutDirective } from './if-logged-out.directive';

describe('IfLoggedOutDirective', () => {
  let service: IfLoggedOutDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IfLoggedOutDirective);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
