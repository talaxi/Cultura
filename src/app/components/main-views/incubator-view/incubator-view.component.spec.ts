import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncubatorViewComponent } from './incubator-view.component';

describe('IncubatorViewComponent', () => {
  let component: IncubatorViewComponent;
  let fixture: ComponentFixture<IncubatorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncubatorViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncubatorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
