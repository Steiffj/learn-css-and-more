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
import { circular } from 'graphology-layout';
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
          circular.assign(graph);
          this.decorateGraph(graph);
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
        delay(12 * 1000),
        map(({ layout, graph }) => {
          layout.stop();
          return graph;
        })
      )
      .subscribe();
  }

  renderSigma(graph: Graph) {
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

  decorateGraph(graph: Graph) {
    graph.forEachNode((node) => {
      // const colors = '.'
      //   .repeat(10)
      //   .split('')
      //   .map(() => chroma.random());

      const colors = [
        '#ffe9d2',
        '#f77e00',
        '#8d3d3d',
        '#5d2828',
        '#401f1f',
        '#7fff00',
        '#4b0082',
        '#7df9ff',
        '#ccccff',
        '#aaaaaa',
      ];

      // label, size, color
      graph.setNodeAttribute(node, 'label', node);
      graph.setNodeAttribute(node, 'color', colors[+node % colors.length]);

      const degree = graph.degree(node);
      graph.setNodeAttribute(node, 'size', degree);
    });
  }
}
