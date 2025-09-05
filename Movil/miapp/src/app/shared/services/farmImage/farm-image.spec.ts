import { TestBed } from '@angular/core/testing';

import { FarmImage } from './farm-image';

describe('FarmImage', () => {
  let service: FarmImage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FarmImage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
