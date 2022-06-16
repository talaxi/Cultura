import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceDescriptionComponent } from './race-description.component';

describe('RaceDescriptionComponent', () => {
  let component: RaceDescriptionComponent;
  let fixture: ComponentFixture<RaceDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaceDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaceDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
