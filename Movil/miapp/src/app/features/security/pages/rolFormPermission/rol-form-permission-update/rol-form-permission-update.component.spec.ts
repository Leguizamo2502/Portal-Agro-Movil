import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RolFormPermissionUpdateComponent } from './rol-form-permission-update.component';

describe('RolFormPermissionUpdateComponent', () => {
  let component: RolFormPermissionUpdateComponent;
  let fixture: ComponentFixture<RolFormPermissionUpdateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RolFormPermissionUpdateComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RolFormPermissionUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
