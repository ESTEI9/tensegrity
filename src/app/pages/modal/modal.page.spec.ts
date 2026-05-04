import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPage } from './modal.page';

describe('ModalPage', () => {
  let component: ModalPage;
  let fixture: ComponentFixture<ModalPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
