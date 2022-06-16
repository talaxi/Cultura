import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalsViewComponent } from './animals-view.component';

describe('AnimalsViewComponent', () => {
  let component: AnimalsViewComponent;
  let fixture: ComponentFixture<AnimalsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimalsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
