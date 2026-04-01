import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Context } from './context';

describe('Context', () => {
  let component: Context;
  let fixture: ComponentFixture<Context>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Context]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Context);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
