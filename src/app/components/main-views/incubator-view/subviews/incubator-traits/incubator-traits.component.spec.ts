import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncubatorTraitsComponent } from './incubator-traits.component';

describe('IncubatorTraitsComponent', () => {
  let component: IncubatorTraitsComponent;
  let fixture: ComponentFixture<IncubatorTraitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncubatorTraitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncubatorTraitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
