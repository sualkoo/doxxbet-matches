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
    fixture.componentRef.setInput('highlightedOdd', 2.3);
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
    fixture.componentRef.setInput('highlightedOdd', 2.3);
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
});
