import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayShowListComponent } from './today-show-list.component';

describe('TodayShowListComponent', () => {
  let component: TodayShowListComponent;
  let fixture: ComponentFixture<TodayShowListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodayShowListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodayShowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
