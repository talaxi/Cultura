import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingTrackRaceViewComponent } from './training-track-race-view.component';

describe('TrainingTrackRaceViewComponent', () => {
  let component: TrainingTrackRaceViewComponent;
  let fixture: ComponentFixture<TrainingTrackRaceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingTrackRaceViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingTrackRaceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
