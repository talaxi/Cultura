import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunCoachingComponent } from './run-coaching.component';

describe('RunCoachingComponent', () => {
  let component: RunCoachingComponent;
  let fixture: ComponentFixture<RunCoachingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RunCoachingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunCoachingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
