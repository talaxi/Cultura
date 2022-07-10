import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAnimalDeckComponent } from './event-animal-deck.component';

describe('EventAnimalDeckComponent', () => {
  let component: EventAnimalDeckComponent;
  let fixture: ComponentFixture<EventAnimalDeckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventAnimalDeckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAnimalDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
