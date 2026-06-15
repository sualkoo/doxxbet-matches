import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ENVIRONMENT } from '../../../environments/environment.token';
import { SiteFooterComponent } from './site-footer.component';

describe('SiteFooterComponent', () => {
  let fixture: ComponentFixture<SiteFooterComponent>;
  let component: SiteFooterComponent;
  const dataFeedUrl = 'https://example.test/data-feed.json';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooterComponent],
      providers: [
        provideRouter([]),
        {
          provide: ENVIRONMENT,
          useValue: {
            production: false,
            apiUrl: dataFeedUrl,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render footer landmarks and brand content', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const footer = nativeElement.querySelector('footer.site-footer');
    const brandLink = nativeElement.querySelector(
      'a.site-footer__brand[aria-label="Go to sport selection"]',
    );
    const summary = nativeElement.querySelector('.site-footer__summary');

    expect(footer).toBeTruthy();
    expect(footer?.getAttribute('aria-label')).toBe('Site footer');
    expect(brandLink?.textContent?.replace(/\s+/g, '')).toBe('DOXXbet');
    expect(summary?.textContent).toContain('grouped leagues and highlighted odds');
  });

  it('should expose footer links navigation and data feed link attributes', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const nav = nativeElement.querySelector('nav.site-footer__links');
    const dataFeedLink = nativeElement.querySelector('.site-footer__links a') as HTMLAnchorElement;

    expect(nav?.getAttribute('aria-label')).toBe('Footer links');
    expect(dataFeedLink).toBeTruthy();
    expect(dataFeedLink.getAttribute('href')).toBe(dataFeedUrl);
    expect(dataFeedLink.target).toBe('_blank');
    expect(dataFeedLink.rel).toBe('noreferrer');
    expect(dataFeedLink.textContent?.trim()).toBe('Data feed');
  });
});
