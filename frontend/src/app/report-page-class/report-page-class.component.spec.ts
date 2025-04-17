import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPageClassComponent } from './report-page-class.component';

describe('ReportPageClassComponent', () => {
  let component: ReportPageClassComponent;
  let fixture: ComponentFixture<ReportPageClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPageClassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportPageClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
