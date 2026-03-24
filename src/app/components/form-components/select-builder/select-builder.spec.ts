import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBuilder } from './select-builder';

describe('SelectBuilder', () => {
  let component: SelectBuilder;
  let fixture: ComponentFixture<SelectBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectBuilder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
