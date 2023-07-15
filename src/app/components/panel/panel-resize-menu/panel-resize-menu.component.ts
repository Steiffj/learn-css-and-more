import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';

export type PanelResizeType = 'none' | 'both' | 'horizontal' | 'vertical';

@Component({
  selector: 'app-panel-resize-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-resize-menu.component.html',
  styleUrls: ['./panel-resize-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PanelResizeMenuComponent {
  icons = './assets/phospher-icons/';

  private horizontalExpanded = false;
  private verticalExpanded = false;

  @Input()
  resize: PanelResizeType = 'none';
  @Output()
  resizeClicked = new EventEmitter<[PanelResizeType, boolean]>();
}
