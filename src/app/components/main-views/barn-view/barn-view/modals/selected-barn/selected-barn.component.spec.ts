import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedBarnComponent } from './selected-barn.component';

describe('SelectedBarnComponent', () => {
  let component: SelectedBarnComponent;
  let fixture: ComponentFixture<SelectedBarnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedBarnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedBarnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
