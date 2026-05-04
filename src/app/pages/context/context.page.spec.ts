import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextPage } from './context.page';

describe('ContextPage', () => {
  let component: ContextPage;
  let fixture: ComponentFixture<ContextPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
