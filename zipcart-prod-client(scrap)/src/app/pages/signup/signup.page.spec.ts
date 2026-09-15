import { Dispatch } from './../../../../node_modules/redux/src/types/store';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SignupPage } from './signup.page';
import { BackendServices } from '../../services/backend-services';
import { ToastService } from '../../services/toast-service';
import { store } from '../../redux-store/store';
import { clearEmailVerification } from '../../redux-features/emailVerificationSlice';

const mockToastService = {
  presentSTDToast: vi.fn(),
};
describe('SignupPage', () => {
  let component: SignupPage;
  let fixture: ComponentFixture<SignupPage>;
  const mockBackendServices = {
    signUpUser: vi.fn(),
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BackendServices,
          useValue: mockBackendServices,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
    });
    fixture = TestBed.createComponent(SignupPage);
    component = fixture.componentInstance;
    // Reset the mock before every test
    mockBackendServices.signUpUser.mockReset();
    mockToastService.presentSTDToast.mockReset();

    // Reset Redux state
    store.dispatch(clearEmailVerification());

    // Prevent real Angular navigation during unit tests
    vi.spyOn(component, 'navigateToEmailVerification').mockImplementation(
      () => {},
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // Form cancellation
  it('should cancel the filled form', () => {
    //setting data
    component.userInput.emailAddress = 'test@example.com';
    component.userInput.password = '@Helloworld123';
    component.passwordConfirmation = '@Helloworld123';

    //Acting
    component.cancelFilledForm();

    // Assert
    expect(component.userInput.emailAddress).toBe('');
    expect(component.userInput.password).toBe('');
    expect(component.passwordConfirmation).toBe('');
  });
  //Email verification
  it('should return true.Provided email is valid', () => {
    //data setup
    component.userInput.emailAddress = 'test@example.com';

    //Act
    expect(component.verifyEmail()).toBe(true);
  });
  it('should return false.Provided email is in-valid', () => {
    //data setup
    component.userInput.emailAddress = 'test@example';

    //Act
    expect(component.verifyEmail()).toBe(false);
  });
  it('should return false. Email field is empty', () => {
    //data setup
    component.userInput.emailAddress = '';

    //Act
    expect(component.verifyEmail()).toBe(false);
  });
  // verify password tests
  it('should return true. Password is valid', () => {
    // set up
    component.userInput.password = '@Helloworld123';

    //Act
    expect(component.verifyPassword()).toBe(true);
  });
  it('should return false. Password is not valid less than 8', () => {
    //setup
    component.userInput.password = '@Hell12';

    //act
    expect(component.verifyPassword()).toBe(false);
  });
  it('should return false. Password is not valid greater than 20', () => {
    //setup
    component.userInput.password = '7bcdefghijklmnopqrst!';

    //act
    expect(component.verifyPassword()).toBe(false);
  });
  it('should return false. Password is not valid no upper case character', () => {
    //setup
    component.userInput.password = '@hello123';

    //act
    expect(component.verifyPassword()).toBe(false);
  });
  it('should return false. Password is not valid no lowercase character', () => {
    //setup
    component.userInput.password = '@HELLO123';

    //act
    expect(component.verifyPassword()).toBe(false);
  });
  it('should return false. Password is not valid no special character', () => {
    //setup
    component.userInput.password = 'hELLO123';

    //act
    expect(component.verifyPassword()).toBe(false);
  });
  it('should return false. Password is not valid does not contain a number', () => {
    //setup
    component.userInput.password = '@hELLOworld';

    //act
    expect(component.verifyPassword()).toBe(false);
  });
  // verify Both passwords

  it('should return true. Both passwords match', () => {
    component.userInput.password = '@Helloworld123';
    component.passwordConfirmation = '@Helloworld123';

    expect(component.verifyBothPasswords()).toBe(true);
  });
  it('should return false. Both passwords does not match', () => {
    component.userInput.password = '@Helloworld123';
    component.passwordConfirmation = '@Helloworld12';

    expect(component.verifyBothPasswords()).toBe(false);
  });
  // user registration tests
  it('should set email error and stop registration when email is invalid', async () => {
    component.userInput.emailAddress = 'test@example';
    component.userInput.password = '@Helloworld123';
    component.passwordConfirmation = '@Helloworld123';

    await component.registerUser();

    expect(component.emailErrorText).toBe(
      'Invalid Email. Please enter a valid email address',
    );

    expect(mockBackendServices.signUpUser).not.toHaveBeenCalled();
  });

  it('should set password error and stop registration when password is invalid', async () => {
    component.userInput.emailAddress = 'test@example.com';
    component.userInput.password = 'hello';
    component.passwordConfirmation = 'hello';

    await component.registerUser();

    expect(component.passwordErrorText).toBe(
      'Password must be of minimum 8 characters in length, must contain a symbol and one number',
    );

    expect(mockBackendServices.signUpUser).not.toHaveBeenCalled();
  });

  it('should set password confirmation error when passwords do not match', async () => {
    component.userInput.emailAddress = 'test@example.com';
    component.userInput.password = '@Helloworld123';
    component.passwordConfirmation = '@Helloworld12';

    await component.registerUser();

    expect(component.verifyPasswordErrorText).toBe('Both passwords must match');

    expect(mockBackendServices.signUpUser).not.toHaveBeenCalled();
  });

  // =====================================================
  // Registration service
  // =====================================================

  it('should call signup service when all validation passes', async () => {
    component.userInput.emailAddress = 'test@example.com';
    component.userInput.password = '@Helloworld123';
    component.passwordConfirmation = '@Helloworld123';

    mockBackendServices.signUpUser.mockResolvedValue({
      success: true,
      message: 'User registered successfully',
    });

    await component.registerUser();

    expect(mockBackendServices.signUpUser).toHaveBeenCalledWith(
      component.userInput,
    );
  });

  // =====================================================
  // Successful registration
  // =====================================================

  it('should handle successful registration, store temp token, show toast, and navigate', async () => {
    component.userInput.emailAddress = 'test@example.com';
    component.userInput.password = '@Helloworld123';
    component.passwordConfirmation = '@Helloworld123';

    const tempToken = '550e8400-e29b-41d4-a716-446655440000';

    mockBackendServices.signUpUser.mockResolvedValue({
      success: true,
      message: 'User registered successfully',
      token: tempToken,
      emailVerified: null,
    });
    const cancelSpy = vi.spyOn(component, 'cancelFilledForm');

    await component.registerUser();

    expect(mockBackendServices.signUpUser).toHaveBeenCalledWith(
      component.userInput,
    );
    // Toast
    expect(mockToastService.presentSTDToast).toHaveBeenCalledWith(
      'Registration Successful. Redirecting to email verification page',
    );

    // Redux
    const state = store.getState();

    expect(state.emailVerification.tempToken).toBe(tempToken);
    expect(state.emailVerification.isEmailVerified).toBe(false);

    expect(cancelSpy).toHaveBeenCalled();

    expect(component.navigateToEmailVerification).toHaveBeenCalled();
  });

  // =====================================================
  // Failed registration
  // =====================================================

  it('should not navigate to email verification when registration fails', async () => {
    component.userInput.emailAddress = 'test@example.com';
    component.userInput.password = '@Helloworld123';
    component.passwordConfirmation = '@Helloworld123';

    mockBackendServices.signUpUser.mockResolvedValue({
      success: false,
      message: 'Email already exists',
    });
    const cancelSpy = vi.spyOn(component, 'cancelFilledForm');

    await component.registerUser();

    expect(component.navigateToEmailVerification).not.toHaveBeenCalled();
    expect(cancelSpy).not.toHaveBeenCalled();
  });

  // =====================================================
  // Service error
  // =====================================================

  it('should handle signup service error', async () => {
    component.userInput.emailAddress = 'test@example.com';
    component.userInput.password = '@Helloworld123';
    component.passwordConfirmation = '@Helloworld123';

    const error = new Error('Network error');

    mockBackendServices.signUpUser.mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cancelSpy = vi.spyOn(component, 'cancelFilledForm');

    await component.registerUser();

    expect(consoleSpy).toHaveBeenCalledWith('Signup request failed:', error);

    expect(component.navigateToEmailVerification).not.toHaveBeenCalled();
    expect(cancelSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
