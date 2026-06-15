import { DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatchesToolbarComponent } from './matches-toolbar.component';
import { vi } from 'vitest';

describe('MatchesToolbarComponent', () => {
  let fixture: ComponentFixture<MatchesToolbarComponent>;
  let component: MatchesToolbarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesToolbarComponent],
      providers: [provideRouter([]), DecimalPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchesToolbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render em dash and disable previous button when highlighted odd is null', () => {
    fixture.componentRef.setInput('highlightedOdd', null);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const label = nativeElement.querySelector('.highlight-label');
    const prevButton = nativeElement.querySelector(
      '[aria-label="Previous highlighted odd"]',
    ) as HTMLButtonElement;

    expect(label?.textContent?.trim()).toBe('—');
    expect(prevButton.disabled).toBe(true);
  });

  it('should render formatted highlighted odd and enable previous button', () => {
    fixture.componentRef.setInput('sortedOddValues', [2.3, 2.1]);
    fixture.componentRef.setInput('highlightLevel', 0);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const label = nativeElement.querySelector('.highlight-label');
    const prevButton = nativeElement.querySelector(
      '[aria-label="Previous highlighted odd"]',
    ) as HTMLButtonElement;

    expect(label?.textContent?.trim()).toBe('2.30');
    expect(prevButton.disabled).toBe(false);
  });

  it('should emit previous and next highlighted odd events', () => {
    fixture.componentRef.setInput('sortedOddValues', [2.3, 2.1]);
    fixture.componentRef.setInput('highlightLevel', 0);
    fixture.detectChanges();
    const prevSpy = vi.spyOn(component.cyclePrevOdd, 'emit');
    const nextSpy = vi.spyOn(component.cycleNextOdd, 'emit');

    const nativeElement = fixture.nativeElement as HTMLElement;
    const prevButton = nativeElement.querySelector(
      '[aria-label="Previous highlighted odd"]',
    ) as HTMLButtonElement;
    const nextButton = nativeElement.querySelector(
      '[aria-label="Next highlighted odd"]',
    ) as HTMLButtonElement;

    nextButton.click();
    fixture.detectChanges();
    prevButton.click();

    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(prevSpy).toHaveBeenCalledTimes(1);
  });

  it('should toggle all leagues collapsed state and update toggle label', () => {
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const toggleButton = nativeElement.querySelector(
      'button[mat-stroked-button]',
    ) as HTMLButtonElement;

    expect(component.allLeaguesCollapsed()).toBe(false);
    expect(toggleButton.textContent?.trim()).toBe('Collapse all');
    expect(toggleButton.getAttribute('aria-label')).toBe('Collapse all leagues');

    toggleButton.click();
    fixture.detectChanges();

    expect(component.allLeaguesCollapsed()).toBe(true);
    expect(toggleButton.textContent?.trim()).toBe('Expand all');
    expect(toggleButton.getAttribute('aria-label')).toBe('Expand all leagues');
  });

  it('should calculate highlighted odd from sorted values and level with wrap-around', () => {
    fixture.componentRef.setInput('sortedOddValues', [3.2, 2.5, 2.1, 1.9, 1.7, 1.6]);
    fixture.componentRef.setInput('highlightLevel', 0);
    fixture.detectChanges();

    expect(component.highlightedOdd()).toBe(3.2);

    fixture.componentRef.setInput('highlightLevel', 1);
    fixture.detectChanges();
    expect(component.highlightedOdd()).toBe(2.5);

    fixture.componentRef.setInput('highlightLevel', -1);
    fixture.detectChanges();
    expect(component.highlightedOdd()).toBe(1.6);
  });

  it('should preserve current highlighted odd when sorted values change and odd is still visible', () => {
    fixture.componentRef.setInput('sortedOddValues', [3.2, 2.5, 2.1]);
    fixture.componentRef.setInput('highlightLevel', 1);
    fixture.detectChanges();

    expect(component.highlightedOdd()).toBe(2.5);

    fixture.componentRef.setInput('sortedOddValues', [5, 4, 2.5, 2]);
    fixture.detectChanges();

    expect(component.highlightedOdd()).toBe(2.5);
  });

  it('should recalculate highlighted odd when current odd is no longer visible', () => {
    fixture.componentRef.setInput('sortedOddValues', [3.2, 2.5, 2.1]);
    fixture.componentRef.setInput('highlightLevel', 1);
    fixture.detectChanges();

    expect(component.highlightedOdd()).toBe(2.5);

    fixture.componentRef.setInput('sortedOddValues', [5, 4, 2]);
    fixture.detectChanges();

    expect(component.highlightedOdd()).toBe(4);
  });

  it('should recalculate highlighted odd when highlight level changes', () => {
    fixture.componentRef.setInput('sortedOddValues', [5, 4, 2.5, 2]);
    fixture.componentRef.setInput('highlightLevel', 1);
    fixture.detectChanges();

    expect(component.highlightedOdd()).toBe(4);

    fixture.componentRef.setInput('highlightLevel', 0);
    fixture.detectChanges();

    expect(component.highlightedOdd()).toBe(5);
  });
});
