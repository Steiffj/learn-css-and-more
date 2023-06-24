import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import Graph from 'graphology';
import random from 'graphology-layout/random';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import FA2Layout from 'graphology-layout-forceatlas2/worker';
import { delay, map, tap } from 'rxjs';
import Sigma from 'sigma';
import { DataSourceService } from '../services/data-source.service';

@Component({
  selector: 'app-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss'],
})
export class VisualizationComponent implements AfterViewInit {
  private readonly dataSourceService = inject(DataSourceService);

  @ViewChild('renderTarget') renderTarget!: ElementRef;
  @HostListener('contextmenu', ['$event'])
  preventCanvasContextMenu(event: Event) {
    event.preventDefault();
  }

  @Output('clickNode')
  nodeClicked: EventEmitter<string> = new EventEmitter();
  @Output('clickStage')
  clickStage: EventEmitter<MouseEvent> = new EventEmitter();

  ngAfterViewInit(): void {
    this.dataSourceService
      .getGnutellaGraph('p2p-Gnutella06')
      .pipe(
        map((graph) => {
          random.assign(graph);
          return graph;
        }),
        tap((graph) => this.renderSigma(graph)),
        map((graph) => {
          const sensibleSettings = forceAtlas2.inferSettings(graph);
          const layout = new FA2Layout(graph, {
            settings: sensibleSettings,
          });

          layout.start();
          return { layout, graph };
        }),
        delay(6 * 1000),
        map(({ layout, graph }) => {
          layout.stop();
          return graph;
        })
      )
      .subscribe();
  }

  public renderSigma(graph: Graph) {
    const renderer = new Sigma(graph, this.renderTarget.nativeElement, {
      defaultEdgeType: 'arrow',
    });

    // Set up Sigma event handlers
    renderer.on('clickNode', (event) => {
      this.nodeClicked.emit(event.node);
    });

    renderer.on('clickStage', (event) => {
      this.clickStage.emit(event.event.original);
    });
  }
}
