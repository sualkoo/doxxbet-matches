import { inject, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'formatDate', standalone: true, pure: true })
export class FormatDatePipe implements PipeTransform {
  private readonly datePipe = inject(DatePipe);

  transform(value: string | Date | null | undefined): string {
    if (value == null) return '';
    return this.datePipe.transform(value, 'd.M. HH:mm') ?? '';
  }
}
