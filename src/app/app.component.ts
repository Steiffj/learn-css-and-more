import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { transformHeight } from './directives/height-transition-animation';
import { HeightTransitionDirective } from './directives/height-transition.directive';
import { VisualizationComponent } from './visualization/visualization.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    VisualizationComponent,
    HeightTransitionDirective,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [transformHeight],
})
export class AppComponent implements AfterViewInit {
  title = 'dep-vis';
  node?: string;
  nodeDetails?: string;

  @ViewChild('subgraph')
  subgraph!: ElementRef;

  subgraphWidth?: string;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.subgraphWidth = this.subgraph.nativeElement.offsetWidth;
    });
  }

  onSigmaNodeClick(node: string) {
    this.node = node;
  }

  onSigmaNodeDetails(details: string) {
    this.nodeDetails = details;
  }
}
