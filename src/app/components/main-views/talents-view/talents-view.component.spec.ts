import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalentsViewComponent } from './talents-view.component';

describe('TalentsViewComponent', () => {
  let component: TalentsViewComponent;
  let fixture: ComponentFixture<TalentsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TalentsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TalentsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
