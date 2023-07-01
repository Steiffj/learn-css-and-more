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
import { delay, filter, map, tap } from 'rxjs';
import Sigma from 'sigma';
import { DataSourceService } from '../services/data-source.service';
import { StateService } from '../services/state.service';
import getNodeProgramImage from 'sigma/rendering/webgl/programs/node.image';

@Component({
  selector: 'app-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss'],
})
export class VisualizationComponent implements AfterViewInit {
  private readonly dataSourceService = inject(DataSourceService);
  private readonly state = inject(StateService);

  @ViewChild('renderTarget') renderTarget!: ElementRef;
  @HostListener('contextmenu', ['$event'])
  preventCanvasContextMenu(event: Event) {
    event.preventDefault();
  }

  @Output('clickNode')
  nodeClicked: EventEmitter<string> = new EventEmitter();
  @Output('clickStage')
  clickStage: EventEmitter<MouseEvent> = new EventEmitter();
  @Output('nodeSelected')
  nodeSelected: EventEmitter<string> = new EventEmitter(); // TODO temp

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
        delay(2 * 1000),
        map(({ layout, graph }) => {
          layout.stop();
          return graph;
        })
      )
      .subscribe();
  }

  renderSigma(graph: Graph) {
    const renderer = new Sigma(graph, this.renderTarget.nativeElement, {
      renderLabels: false,
      renderEdgeLabels: true,
      defaultEdgeType: 'arrow',
      nodeProgramClasses: {
        image: getNodeProgramImage(),
      },
      allowInvalidContainer: true, // TODO temp
    });

    // Set up Sigma event handlers
    renderer.on('clickNode', (event) => {
      this.nodeClicked.emit(event.node);
    });

    renderer.on('clickStage', (event) => {
      this.clickStage.emit(event.event.original);
      this.state.clearSelection();
    });

    // TODO handle edge cases in which new selected node was previously a highlighted
    // or selected node is double clicked
    // (may require proper state management to do well)
    const toggleSelectionHighlight = (
      graph: Graph,
      node: string,
      show = true
    ) => {
      // Current node display updates
      if (show) {
        graph.setNodeAttribute(node, 'highlighted', true);
        const image = graph.getNodeAttribute(node, 'image-hidden');
        graph.setNodeAttribute(node, 'image', image);
        graph.setNodeAttribute(node, 'type', 'image');
      } else {
        graph.setNodeAttribute(node, 'highlighted', false);
        graph.removeNodeAttribute(node, 'image');
        graph.removeNodeAttribute(node, 'type');
      }

      // Neighboring node/edge display updates
      graph.forEachEdge(node, (edge) => {
        const neighbor = graph.opposite(node, edge);
        graph.setNodeAttribute(neighbor, 'highlighted', show);

        const image = graph.getNodeAttribute(neighbor, 'image-hidden');
        graph.setNodeAttribute(neighbor, 'image', image);

        if (show) {
          graph.setNodeAttribute(neighbor, 'highlighted', true);
          const label = graph.getEdgeAttribute(edge, 'label-hidden');
          graph.setEdgeAttribute(edge, 'label', label);
          const image = graph.getNodeAttribute(neighbor, 'image-hidden');
          graph.setNodeAttribute(neighbor, 'image', image);
          graph.setNodeAttribute(neighbor, 'type', 'image');
        } else {
          graph.setNodeAttribute(neighbor, 'highlighted', false);
          graph.removeEdgeAttribute(edge, 'label');
          graph.removeNodeAttribute(neighbor, 'image');
          graph.removeNodeAttribute(neighbor, 'type');
        }
      });
    };

    renderer.on('clickNode', (event) => {
      const selectedNode = event.node;
      toggleSelectionHighlight(graph, selectedNode);
      this.state.selectedNode$.next(selectedNode);
    });

    // would like to write reactive wrappers around Sigma/Graphology methods
    // TODO handle subscription cleanup
    this.state.selectedNodeStateChange$
      .pipe(filter((selectionState) => !!selectionState.oldSelectedNode))
      .subscribe((selectionState) => {
        toggleSelectionHighlight(graph, selectionState.oldSelectedNode!, false);
      });

    // TODO temp
    this.state.selectedNode$.subscribe((node) => {
      const nodeData = !!node
        ? {
            ...graph.getNodeAttributes(node),
            degree: graph.degree(node),
          }
        : '';
      this.nodeSelected.emit(JSON.stringify(nodeData, null, 2));
    });
  }

  decorateGraph(graph: Graph) {
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

    graph.forEachNode((node) => {
      const getNodeIcon = (graph: Graph, node: string) => {
        const iconPath = './assets/phospher-icons/';

        const degree = graph.degree(node);
        if (degree < 10) {
          return iconPath + 'user.svg';
        } else if (degree < 50) {
          return iconPath + 'user-circle-gear.svg';
        } else if (degree < 100) {
          return iconPath + 'hard-drives-thin.svg';
        } else {
          return iconPath + 'database-thin.svg';
        }
      };

      // label, size, color, image
      graph.setNodeAttribute(node, 'label', node);
      graph.setNodeAttribute(node, 'color', colors[+node % colors.length]);
      graph.setNodeAttribute(node, 'image-hidden', getNodeIcon(graph, node));

      const degree = graph.degree(node);
      graph.setNodeAttribute(node, 'size', degree);
    });

    graph.forEachEdge((edge) => {
      graph.setEdgeAttribute(edge, 'label-hidden', 'Shared with');
    });
  }
}
