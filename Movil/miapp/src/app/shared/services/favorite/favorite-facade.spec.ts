import { FavoriteFacadeService } from "./favorite-facade";
import { TestBed } from '@angular/core/testing';


describe('FavoriteFacadeService', () => {
  let service: FavoriteFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoriteFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
