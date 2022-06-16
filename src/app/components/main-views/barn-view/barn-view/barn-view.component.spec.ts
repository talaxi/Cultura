import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarnViewComponent } from './barn-view.component';

describe('BarnViewComponent', () => {
  let component: BarnViewComponent;
  let fixture: ComponentFixture<BarnViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarnViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BarnViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
