import { DecimalPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { FormatOddPipe } from './format-odd.pipe';

describe('FormatOddPipe', () => {
  let pipe: FormatOddPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DecimalPipe],
    });

    pipe = TestBed.runInInjectionContext(() => new FormatOddPipe());
  });

  it('should return em dash for nullish values', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
  });

  it('should format values with two decimal places', () => {
    expect(pipe.transform(2.3)).toBe('2.30');
  });

  it('should round to two decimal places', () => {
    expect(pipe.transform(2.345)).toBe('2.35');
  });
});
