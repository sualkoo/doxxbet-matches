import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ApiResponse } from '../models/api-response.model';
import { MatchesService } from './matches.service';
import { ENVIRONMENT } from '../../../environments/environment.token';

describe('MatchesService', () => {
  let service: MatchesService;
  let httpMock: HttpTestingController;

  const apiUrl = 'https://example.test/matches.json';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MatchesService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: {
            production: false,
            apiUrl,
          },
        },
      ],
    });

    service = TestBed.inject(MatchesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should request matches from configured environment api url', () => {
    const response: ApiResponse = {
      EventChanceTypes: [],
      Odds: {},
      Labels: {},
    };

    let actual: ApiResponse | undefined;

    service.getMatches().subscribe((value) => {
      actual = value;
    });

    const request = httpMock.expectOne(apiUrl);
    expect(request.request.method).toBe('GET');
    request.flush(response);

    expect(actual).toEqual(response);
  });

  it('should retry twice and eventually succeed', () => {
    const response: ApiResponse = {
      EventChanceTypes: [],
      Odds: {},
    };

    let actual: ApiResponse | undefined;

    service.getMatches().subscribe((value) => {
      actual = value;
    });

    const request1 = httpMock.expectOne(apiUrl);
    request1.flush('server error', { status: 500, statusText: 'Server Error' });

    const request2 = httpMock.expectOne(apiUrl);
    request2.flush('server error', { status: 500, statusText: 'Server Error' });

    const request3 = httpMock.expectOne(apiUrl);
    request3.flush(response);

    expect(actual).toEqual(response);
  });

  it('should retry twice then propagate error and log it', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let actualError: unknown;

    service.getMatches().subscribe({
      next: () => {
        throw new Error('Expected request to fail');
      },
      error: (error) => {
        actualError = error;
      },
    });

    const request1 = httpMock.expectOne(apiUrl);
    request1.flush('server error', { status: 500, statusText: 'Server Error' });

    const request2 = httpMock.expectOne(apiUrl);
    request2.flush('server error', { status: 500, statusText: 'Server Error' });

    const request3 = httpMock.expectOne(apiUrl);
    request3.flush('server error', { status: 500, statusText: 'Server Error' });

    expect(actualError).toBeTruthy();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch matches:', expect.anything());
  });
});
