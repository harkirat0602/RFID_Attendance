import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsReportComponent } from './report-page-students.component';

describe('ReportPageComponent', () => {
  let component: StudentsReportComponent;
  let fixture: ComponentFixture<StudentsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
