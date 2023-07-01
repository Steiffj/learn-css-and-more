import { animate, style, transition, trigger } from '@angular/animations';

export const transformHeight = trigger('grow', [
  transition('void <=> *', []),
  transition(
    '* <=> *',
    [style({ height: '{{startHeight}}px' }), animate('.5s ease')],
    {
      params: { startHeight: 0 },
    }
  ),
]);
