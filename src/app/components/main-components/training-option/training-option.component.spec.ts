import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingOptionComponent } from './training-option.component';

describe('TrainingOptionComponent', () => {
  let component: TrainingOptionComponent;
  let fixture: ComponentFixture<TrainingOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingOptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
