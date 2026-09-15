import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../redux-store/store';
import { BackendServices } from '../services/backend-services';

export interface EmailVerificationState {
  isEmailVerified: boolean;
  tempToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EmailVerificationState = {
  isEmailVerified: false,
  tempToken: null,
  isLoading: false,
  error: null,
};

/*
 * Async email verification
 *
 * Payload:
 *   tempToken: string
 *
 * Response:
 *   BackendNormalResponse
 */
export const verifyEmail = createAsyncThunk(
  'emailVerification/verifyEmail',
  async (tempToken: string, thunkAPI) => {
    try {
      const service = new BackendServices();

      const response = await service.isEmailVerified(tempToken);

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error instanceof Error ? error.message : 'Email verification failed',
      );
    }
  },
);

const emailVerificationSlice = createSlice({
  name: 'emailVerification',

  initialState,

  reducers: {
    setTempToken: (state, action: PayloadAction<string>) => {
      state.tempToken = action.payload;
      state.isEmailVerified = false;
      state.error = null;
    },

    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.isEmailVerified = action.payload;

      if (action.payload) {
        state.tempToken = null;
      }
    },

    clearEmailVerification: (state) => {
      state.tempToken = null;
      state.isEmailVerified = false;
      state.isLoading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==========================================
      // Verification started
      // ==========================================
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      // ==========================================
      // Verification successful
      // ==========================================
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;

        state.isEmailVerified = action.payload.emailVerified ?? false;

        if (state.isEmailVerified) {
          state.tempToken = null;
        }
      })

      // ==========================================
      // Verification failed
      // ==========================================
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;

        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Email verification failed';
      });
  },
});

export const { setTempToken, setEmailVerified, clearEmailVerification } =
  emailVerificationSlice.actions;

export const selectTempToken = (state: RootState) =>
  state.emailVerification.tempToken;

export const selectIsEmailVerified = (state: RootState) =>
  state.emailVerification.isEmailVerified;

export const selectIsEmailVerificationLoading = (state: RootState) =>
  state.emailVerification.isLoading;

export const selectEmailVerificationError = (state: RootState) =>
  state.emailVerification.error;

export default emailVerificationSlice.reducer;
