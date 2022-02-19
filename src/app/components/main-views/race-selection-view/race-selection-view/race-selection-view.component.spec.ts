import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceSelectionViewComponent } from './race-selection-view.component';

describe('RaceSelectionViewComponent', () => {
  let component: RaceSelectionViewComponent;
  let fixture: ComponentFixture<RaceSelectionViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaceSelectionViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaceSelectionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
