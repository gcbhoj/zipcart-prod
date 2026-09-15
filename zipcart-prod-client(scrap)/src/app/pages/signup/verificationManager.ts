import { retry } from 'rxjs';

const MIN_LENGTH = 8;
const MAX_LENGTH = 20;

const UPPER_CASES = 1;
const LOWER_CASES = 1;
const SPECIAL_CHARACTERS = 1;
const NUMERICAL_CHARACTERS = 1;

export const validatePassword = (password: string): boolean => {
  // Check minimum length
  if (password.length < MIN_LENGTH) {
    return false;
  }

  // Check maximum length
  if (password.length > MAX_LENGTH) {
    return false;
  }

  // Count uppercase letters
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;

  // Count lowercase letters
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;

  // Count special characters
  const specialCharacterCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
  // count numerical characters
  const numericalCharacterCount = (password.match(/[0-9]/g) || []).length;

  // Check requirements
  if (uppercaseCount < UPPER_CASES) {
    return false;
  }

  if (lowercaseCount < LOWER_CASES) {
    return false;
  }

  if (specialCharacterCount < SPECIAL_CHARACTERS) {
    return false;
  }
  if (numericalCharacterCount < NUMERICAL_CHARACTERS) {
    return false;
  }

  return true;
};

export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};
