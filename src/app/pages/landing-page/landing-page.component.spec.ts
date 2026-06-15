import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';
import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  let fixture: ComponentFixture<LandingPageComponent>;
  let component: LandingPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render main landing structure and brand content', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const main = nativeElement.querySelector('main.landing');
    const title = nativeElement.querySelector('#landing-title');
    const eyebrow = nativeElement.querySelector('.landing__eyebrow');
    const copy = nativeElement.querySelector('.landing__copy');

    expect(main).toBeTruthy();
    expect(main?.getAttribute('aria-labelledby')).toBe('landing-title');
    expect(title?.getAttribute('aria-label')).toBe('DOXXbet');
    expect(title?.textContent?.replace(/\s+/g, '')).toBe('DOXXbet');
    expect(eyebrow?.textContent?.trim()).toBe('Match center');
    expect(copy?.textContent).toContain('grouped leagues');
  });

  it('should render matches cta with router link and accessible label', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const cta = nativeElement.querySelector('a.landing__cta') as HTMLAnchorElement;
    const routerLinkDirective = fixture.debugElement.query(By.directive(RouterLink));

    expect(cta).toBeTruthy();
    expect(cta.textContent?.trim()).toBe('Matches');
    expect(cta.getAttribute('aria-label')).toBe('Open matches page');
    expect(routerLinkDirective).toBeTruthy();
  });

  it('should render six sport icons in the decorative icon block', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const iconBlock = nativeElement.querySelector('.landing__icons');
    const icons = nativeElement.querySelectorAll('mat-icon.landing__icon');

    expect(iconBlock?.getAttribute('aria-hidden')).toBe('true');
    expect(icons.length).toBe(6);
  });
});
