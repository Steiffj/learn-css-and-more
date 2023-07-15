import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { transformHeight } from './directives/height-transition-animation';
import { HeightTransitionDirective } from './directives/height-transition.directive';
import { VisualizationComponent } from './visualization/visualization.component';
import { PanelResizeMenuComponent } from './components/panel/panel-resize-menu/panel-resize-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    VisualizationComponent,
    HeightTransitionDirective,
    PanelResizeMenuComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [transformHeight],
})
export class AppComponent {
  title = 'dep-vis';
  node?: string;
  nodeDetails?: string;

  onSigmaNodeClick(node: string) {
    this.node = node;
  }

  onSigmaNodeDetails(details: string) {
    this.nodeDetails = details;
  }
}
