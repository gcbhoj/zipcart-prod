import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EmailverificationPage } from './emailverification.page';

import { BackendServices } from '../../services/backend-services';
import { ToastService } from '../../services/toast-service';

import {
  clearEmailVerification,
  setTempToken,
} from '../../redux-features/emailVerificationSlice';

import { store } from '../../redux-store/store';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('EmailverificationPage', () => {
  let component: EmailverificationPage;
  let fixture: ComponentFixture<EmailverificationPage>;

  const mockBackendServices = {
    resendEmailVerification: vi.fn(),
  };

  const mockToastService = {
    presentSTDToast: vi.fn(),
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    // Reset Redux state before every test
    store.dispatch(clearEmailVerification());

    await TestBed.configureTestingModule({
      imports: [EmailverificationPage],

      providers: [
        provideRouter([]),

        {
          provide: BackendServices,
          useValue: mockBackendServices,
        },

        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailverificationPage);
    component = fixture.componentInstance;

    mockBackendServices.resendEmailVerification.mockReset();
    mockToastService.presentSTDToast.mockReset();

    fixture.detectChanges();
  });

  afterEach(() => {
    component?.stopTimer();

    vi.clearAllTimers();
    vi.useRealTimers();

    store.dispatch(clearEmailVerification());
  });

  // ==========================================================
  // Component creation
  // ==========================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ==========================================================
  // Timer
  // ==========================================================

  it('should start the verification timer on initialization', () => {
    expect(vi.getTimerCount()).toBe(1);
  });

  it('should not create multiple timers', () => {
    component.executeFunction();
    component.executeFunction();

    expect(vi.getTimerCount()).toBe(1);
  });

  it('should stop the verification timer', () => {
    expect(vi.getTimerCount()).toBe(1);

    component.stopTimer();

    expect(vi.getTimerCount()).toBe(0);
  });

  // ==========================================================
  // Missing token
  // ==========================================================

  it('should stop the timer and show a toast when no token exists', async () => {
    component.stopTimer();

    await component.verifyEmailAddress();

    expect(mockToastService.presentSTDToast).toHaveBeenCalledWith(
      'No email verification token was found.',
    );

    expect(vi.getTimerCount()).toBe(0);
  });

  // ==========================================================
  // Resend verification email
  // ==========================================================

  it('should resend the verification email when a token exists', async () => {
    const tempToken = 'test-token-123';

    store.dispatch(setTempToken(tempToken));

    mockBackendServices.resendEmailVerification.mockResolvedValue({
      success: true,
      message: 'Verification email sent',
    });

    await component.resendEmailVerification();

    expect(mockBackendServices.resendEmailVerification).toHaveBeenCalledWith(
      tempToken,
    );

    expect(mockToastService.presentSTDToast).toHaveBeenCalledWith(
      'Verification email sent again.',
    );

    expect(vi.getTimerCount()).toBe(1);
  });

  it('should show a toast when resend is attempted without a token', async () => {
    component.stopTimer();

    await component.resendEmailVerification();

    expect(mockBackendServices.resendEmailVerification).not.toHaveBeenCalled();

    expect(mockToastService.presentSTDToast).toHaveBeenCalledWith(
      'No email verification token was found.',
    );
  });

  it('should show an error toast when resend fails', async () => {
    const tempToken = 'test-token-123';

    store.dispatch(setTempToken(tempToken));

    mockBackendServices.resendEmailVerification.mockRejectedValue(
      new Error('Network error'),
    );

    await component.resendEmailVerification();

    expect(mockBackendServices.resendEmailVerification).toHaveBeenCalledWith(
      tempToken,
    );

    expect(mockToastService.presentSTDToast).toHaveBeenCalledWith(
      'Unable to resend verification email.',
    );

    expect(vi.getTimerCount()).toBe(1);
  });

  // ==========================================================
  // Successful verification
  // ==========================================================

  it('should verify the email and navigate to login when verification succeeds', async () => {
    const tempToken = 'test-token-123';

    store.dispatch(setTempToken(tempToken));

    const navigateSpy = vi
      .spyOn(component['router'], 'navigate')
      .mockResolvedValue(true);

    /*
     * Mock the Redux thunk dispatch.
     *
     * The real thunk calls BackendServices internally.
     * This test replaces store.dispatch temporarily so
     * we can test the page behavior independently.
     */
    const dispatchSpy = vi.spyOn(store, 'dispatch').mockResolvedValue({
      type: 'emailVerification/verifyEmail/fulfilled',
      payload: {
        success: true,
        message: 'Email verified successfully',
        emailVerified: true,
      },
    } as never);

    await component.verifyEmailAddress();

    expect(dispatchSpy).toHaveBeenCalled();

    expect(mockToastService.presentSTDToast).toHaveBeenCalledWith(
      'Email verified successfully.',
    );

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);

    expect(vi.getTimerCount()).toBe(0);

    dispatchSpy.mockRestore();
    navigateSpy.mockRestore();
  });

  // ==========================================================
  // Email not verified
  // ==========================================================

  it('should continue polling when email is not verified', async () => {
    const tempToken = 'test-token-123';

    store.dispatch(setTempToken(tempToken));

    const dispatchSpy = vi.spyOn(store, 'dispatch').mockResolvedValue({
      type: 'emailVerification/verifyEmail/fulfilled',
      payload: {
        success: true,
        message: 'Email not verified',
        emailVerified: false,
      },
    } as never);

    await component.verifyEmailAddress();

    expect(dispatchSpy).toHaveBeenCalled();

    expect(mockToastService.presentSTDToast).not.toHaveBeenCalled();

    // Timer should still exist
    expect(vi.getTimerCount()).toBe(1);

    dispatchSpy.mockRestore();
  });

  // ==========================================================
  // Verification request failure
  // ==========================================================

  it('should not show a toast when verification request fails', async () => {
    const tempToken = 'test-token-123';

    store.dispatch(setTempToken(tempToken));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const dispatchSpy = vi.spyOn(store, 'dispatch').mockResolvedValue({
      type: 'emailVerification/verifyEmail/rejected',
      payload: 'Email verification failed',
    } as never);

    await component.verifyEmailAddress();

    expect(dispatchSpy).toHaveBeenCalled();

    expect(consoleSpy).toHaveBeenCalled();

    expect(mockToastService.presentSTDToast).not.toHaveBeenCalled();

    dispatchSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  // ==========================================================
  // Polling
  // ==========================================================

  it('should call verifyEmailAddress after 10 seconds', async () => {
    const verifySpy = vi
      .spyOn(component, 'verifyEmailAddress')
      .mockResolvedValue();

    await vi.advanceTimersByTimeAsync(10000);

    expect(verifySpy).toHaveBeenCalledTimes(1);

    verifySpy.mockRestore();
  });

  it('should call verifyEmailAddress every 10 seconds', async () => {
    const verifySpy = vi
      .spyOn(component, 'verifyEmailAddress')
      .mockResolvedValue();

    await vi.advanceTimersByTimeAsync(30000);

    expect(verifySpy).toHaveBeenCalledTimes(3);

    verifySpy.mockRestore();
  });

  // ==========================================================
  // Navigation
  // ==========================================================

  it('should navigate to login and clear verification state', () => {
    const navigateSpy = vi
      .spyOn(component['router'], 'navigate')
      .mockResolvedValue(true);

    component.navigateToLogin();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);

    expect(vi.getTimerCount()).toBe(0);

    expect(store.getState().emailVerification.tempToken).toBeNull();

    expect(store.getState().emailVerification.isEmailVerified).toBe(false);

    navigateSpy.mockRestore();
  });

  // ==========================================================
  // Cleanup
  // ==========================================================

  it('should stop the timer when the component is destroyed', () => {
    expect(vi.getTimerCount()).toBe(1);

    component.ngOnDestroy();

    expect(vi.getTimerCount()).toBe(0);
  });
});
