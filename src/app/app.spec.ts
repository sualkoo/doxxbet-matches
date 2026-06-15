import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ENVIRONMENT } from '../environments/environment.token';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: ENVIRONMENT,
          useValue: {
            production: false,
            apiUrl: 'https://example.test/list.json',
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the site footer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-site-footer')).toBeTruthy();
  });
});
