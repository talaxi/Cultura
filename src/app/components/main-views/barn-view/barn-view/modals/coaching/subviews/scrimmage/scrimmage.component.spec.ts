import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrimmageComponent } from './scrimmage.component';

describe('ScrimmageComponent', () => {
  let component: ScrimmageComponent;
  let fixture: ComponentFixture<ScrimmageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrimmageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrimmageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
