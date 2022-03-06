import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawRaceComponent } from './draw-race.component';

describe('DrawRaceComponent', () => {
  let component: DrawRaceComponent;
  let fixture: ComponentFixture<DrawRaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawRaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawRaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
