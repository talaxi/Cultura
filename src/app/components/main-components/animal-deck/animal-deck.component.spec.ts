import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalDeckComponent } from './animal-deck.component';

describe('AnimalDeckComponent', () => {
  let component: AnimalDeckComponent;
  let fixture: ComponentFixture<AnimalDeckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimalDeckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
