import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sportColor', standalone: true, pure: true })
export class SportColorPipe implements PipeTransform {
  transform(sportName: string): string {
    const name = sportName?.toLowerCase() ?? '';
    if (name.includes('football') || name.includes('soccer')) return 'sport--football';
    if (name.includes('tennis')) return 'sport--tennis';
    if (name.includes('basketball')) return 'sport--basketball';
    if (name.includes('ice hockey') || name.includes('hockey')) return 'sport--hockey';
    return 'sport--default';
  }
}
