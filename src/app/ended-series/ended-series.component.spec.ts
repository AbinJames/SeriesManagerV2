import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndedSeriesComponent } from './ended-series.component';

describe('EndedSeriesComponent', () => {
  let component: EndedSeriesComponent;
  let fixture: ComponentFixture<EndedSeriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndedSeriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndedSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
