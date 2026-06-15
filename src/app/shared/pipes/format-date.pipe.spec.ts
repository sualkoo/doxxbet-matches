import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { FormatDatePipe } from './format-date.pipe';

describe('FormatDatePipe', () => {
  let pipe: FormatDatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatePipe],
    });

    pipe = TestBed.runInInjectionContext(() => new FormatDatePipe());
  });

  it('should return empty string for nullish values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should format date values using d.M. HH:mm pattern', () => {
    const date = new Date(2026, 5, 15, 9, 5);

    expect(pipe.transform(date)).toBe('15.6. 09:05');
  });

  it('should throw for invalid date input', () => {
    expect(() => pipe.transform('not-a-date')).toThrow();
  });
});
