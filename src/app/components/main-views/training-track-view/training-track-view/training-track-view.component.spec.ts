import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingTrackViewComponent } from './training-track-view.component';

describe('TrainingTrackViewComponent', () => {
  let component: TrainingTrackViewComponent;
  let fixture: ComponentFixture<TrainingTrackViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingTrackViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingTrackViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
