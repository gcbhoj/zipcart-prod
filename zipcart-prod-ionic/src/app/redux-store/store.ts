import { configureStore } from '@reduxjs/toolkit';
import emailVerificationReducer from '../redux-features/emailVerificationSlice';

export const store = configureStore({
  reducer: {
    emailVerification: emailVerificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
