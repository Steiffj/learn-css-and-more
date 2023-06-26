import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, scan } from 'rxjs';

type SelectionState = {
  oldSelectedNode: string | undefined;
  currentSelectedNode: string | undefined;
};

@Injectable({
  providedIn: 'root',
})
export class StateService {
  selectedNode$: BehaviorSubject<string | undefined> = new BehaviorSubject<
    string | undefined
  >(undefined);

  selectedNodeStateChange$ = this.selectedNode$.pipe(
    scan(
      (oldState: SelectionState, newSelectedNode) => ({
        oldSelectedNode: oldState.currentSelectedNode,
        currentSelectedNode: newSelectedNode,
      }),
      { oldSelectedNode: undefined, currentSelectedNode: undefined }
    ),
    distinctUntilChanged()
  );

  selectNode(node: string) {
    this.selectedNode$.next(node);
  }

  clearSelection() {
    this.selectedNode$.next(undefined);
  }
}
