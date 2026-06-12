import { inject, Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({ name: 'formatOdd', standalone: true, pure: true })
export class FormatOddPipe implements PipeTransform {
  private readonly decimalPipe = inject(DecimalPipe);

  transform(value: number | null | undefined): string {
    if (value == null) return '—';
    return this.decimalPipe.transform(value, '1.2-2') ?? '—';
  }
}
