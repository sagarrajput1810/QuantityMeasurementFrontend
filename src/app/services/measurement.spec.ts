import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Measurement } from './measurement';

describe('Measurement', () => {
  let service: Measurement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Measurement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
