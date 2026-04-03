import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceBasedModal } from './service-based-modal';

describe('ServiceBasedModal', () => {
  let component: ServiceBasedModal;
  let fixture: ComponentFixture<ServiceBasedModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceBasedModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceBasedModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
