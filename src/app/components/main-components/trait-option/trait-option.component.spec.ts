import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraitOptionComponent } from './trait-option.component';

describe('TraitOptionComponent', () => {
  let component: TraitOptionComponent;
  let fixture: ComponentFixture<TraitOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TraitOptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TraitOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
