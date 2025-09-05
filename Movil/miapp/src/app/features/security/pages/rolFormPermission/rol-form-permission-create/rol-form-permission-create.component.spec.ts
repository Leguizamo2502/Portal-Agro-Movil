import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RolFormPermissionCreateComponent } from './rol-form-permission-create.component';

describe('RolFormPermissionCreateComponent', () => {
  let component: RolFormPermissionCreateComponent;
  let fixture: ComponentFixture<RolFormPermissionCreateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RolFormPermissionCreateComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RolFormPermissionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
