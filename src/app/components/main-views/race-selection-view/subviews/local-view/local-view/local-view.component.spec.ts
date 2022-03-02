import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalViewComponent } from './local-view.component';

describe('LocalViewComponent', () => {
  let component: LocalViewComponent;
  let fixture: ComponentFixture<LocalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
