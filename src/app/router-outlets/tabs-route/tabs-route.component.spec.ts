import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsRouteComponent } from './tabs-route.component';

describe('TabsRouteComponent', () => {
  let component: TabsRouteComponent;
  let fixture: ComponentFixture<TabsRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsRouteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabsRouteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
