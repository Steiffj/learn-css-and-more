import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import Graph from 'graphology';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataSourceService {
  private http = inject(HttpClient);

  getGnutellaGraph(filename: string) {
    return this.http
      .get(`assets/${filename}.txt`, {
        responseType: 'text',
      })
      .pipe(map((resp) => this.parseGraphFromData(resp)));
  }

  private parseGraphFromData(text: string) {
    const relationshipSep = '\r\n';
    const entitySep = '\t';
    const comment = '#';

    const noComments = (line: string) => !line.startsWith(comment);
    const noBlanks = (line: string) => !(line.trim() === '');

    const dataTable = text
      .split(relationshipSep)
      .filter((line) => noComments(line) && noBlanks(line))
      .map((relat) => relat.split(entitySep));
    const uniqueNodes = new Set<string>();
    dataTable.flat().forEach((node) => {
      uniqueNodes.add(node);
    });

    // const nodes = Array.from(new Set(...dataTable.flat())).map(val => ({ key: val }));
    const nodes = Array.from(uniqueNodes).map((val) => ({ key: val }));

    const edges = dataTable.map((relat) => ({
      key: `${relat[0]}->${relat[1]}`,
      source: relat[0],
      target: relat[1],
      attributes: {
        relationship: 'Shared with',
      },
    }));

    const graph = new Graph();
    graph.import({
      attributes: { name: 'Directed Gnutella P2P network from August 6 2002' },
      nodes,
      edges,
      options: {
        allowSelfLoops: true,
      },
    });

    return graph;
  }
}
