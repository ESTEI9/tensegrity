import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextSetter } from './context-setter';

describe('ContextSetter', () => {
  let component: ContextSetter;
  let fixture: ComponentFixture<ContextSetter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextSetter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextSetter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
