import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPageAttendanceComponent } from './report-page-attendance.component';

describe('ReportPageAttendanceComponent', () => {
  let component: ReportPageAttendanceComponent;
  let fixture: ComponentFixture<ReportPageAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPageAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportPageAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
