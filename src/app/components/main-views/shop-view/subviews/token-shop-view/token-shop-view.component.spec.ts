import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenShopViewComponent } from './token-shop-view.component';

describe('TokenShopViewComponent', () => {
  let component: TokenShopViewComponent;
  let fixture: ComponentFixture<TokenShopViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenShopViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenShopViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
