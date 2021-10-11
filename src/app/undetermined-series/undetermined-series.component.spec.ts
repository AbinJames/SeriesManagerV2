import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndeterminedSeriesComponent } from './undetermined-series.component';

describe('UndeterminedSeriesComponent', () => {
  let component: UndeterminedSeriesComponent;
  let fixture: ComponentFixture<UndeterminedSeriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UndeterminedSeriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndeterminedSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
