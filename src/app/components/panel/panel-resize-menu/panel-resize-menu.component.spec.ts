import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelResizeMenuComponent } from './panel-resize-menu.component';

describe('PanelResizeMenuComponent', () => {
  let component: PanelResizeMenuComponent;
  let fixture: ComponentFixture<PanelResizeMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PanelResizeMenuComponent]
    });
    fixture = TestBed.createComponent(PanelResizeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
