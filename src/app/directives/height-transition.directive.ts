import {
  Directive,
  ElementRef,
  HostBinding,
  Input,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appHeightTransition]',
  standalone: true,
})
export class HeightTransitionDirective {
  @Input() appHeightTransition: unknown;
  pulse = false;
  // TODO need to keep track of the host's previous size to prevent twitching on small size changes
  startHeight = 0;

  constructor(private element: ElementRef) {}

  @HostBinding('@grow')
  get grow() {
    return { value: this.pulse, params: { startHeight: this.startHeight } };
  }

  setStartHeight() {
    this.startHeight = this.element.nativeElement.clientHeight;
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    this.setStartHeight();
    this.pulse = !this.pulse;
  }
}
