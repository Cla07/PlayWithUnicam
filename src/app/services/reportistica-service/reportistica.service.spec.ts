import { TestBed } from '@angular/core/testing';

import { ReportisticaService } from './reportistica.service';

describe('ReportisticaService', () => {
  let service: ReportisticaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportisticaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
