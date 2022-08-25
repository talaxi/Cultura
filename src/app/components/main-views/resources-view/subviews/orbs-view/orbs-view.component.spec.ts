import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrbsViewComponent } from './orbs-view.component';

describe('OrbsViewComponent', () => {
  let component: OrbsViewComponent;
  let fixture: ComponentFixture<OrbsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrbsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrbsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
