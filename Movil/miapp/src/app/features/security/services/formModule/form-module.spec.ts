import { TestBed } from '@angular/core/testing';

import { FormModule } from './form-module';

describe('FormModule', () => {
  let service: FormModule;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormModule);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
