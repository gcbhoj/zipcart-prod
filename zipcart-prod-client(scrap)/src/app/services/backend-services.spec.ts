import { TestBed } from '@angular/core/testing';

import { BackendServices } from './backend-services';

describe('BackendServices', () => {
  let service: BackendServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
