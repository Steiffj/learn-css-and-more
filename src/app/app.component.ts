import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { VisualizationComponent } from './visualization/visualization.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, VisualizationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'dep-vis';
  node?: string;

  onSigmaNodeClick(node: string) {
    this.node = node;
  }
}
