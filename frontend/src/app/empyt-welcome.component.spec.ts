import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpytWelcomeComponent } from './empyt-welcome.component';

describe('EmpytWelcomeComponent', () => {
  let component: EmpytWelcomeComponent;
  let fixture: ComponentFixture<EmpytWelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpytWelcomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpytWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
