import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast-service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
