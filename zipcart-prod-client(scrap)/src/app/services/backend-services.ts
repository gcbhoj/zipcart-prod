import { errors } from './../../../node_modules/immer/src/utils/errors';
import { Injectable } from '@angular/core';
import { SignUpCredentials } from './../DTOs/signUpCredentials';
import { BackendNormalResponse } from '../DTOs/backendResponses';

@Injectable({
  providedIn: 'root',
})
export class BackendServices {
  private readonly BACKEND_URL = 'http://localhost:5100/api/v1';

  async signUpUser(
    credentials: SignUpCredentials,
  ): Promise<BackendNormalResponse> {
    // =====================================================
    // MOCK RESPONSE
    // Remove/comment this section when backend is ready
    // =====================================================

    console.log('Mock signup request:', credentials);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data: BackendNormalResponse = {
      success: true,
      message: 'User registered successfully',
      token: '550e8400-e29b-41d4-a716-446655440000',
      emailVerified: null,
    };

    return data;

    // =====================================================
    // REAL BACKEND
    // Uncomment when backend is ready
    // =====================================================
    // try {
    //   const response = await fetch(`${this.BACKEND_URL}/user/signup`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       emailAddress: credentials.emailAddress,
    //       password: credentials.password,
    //     }),
    //   });

    //   const data: BackendNormalResponse = await response.json();
    //   if (!response.ok) {
    //     throw new Error(data.message);
    //   }

    //   return data;
    // } catch (error) {
    //   console.error('Signup request failed:', error);

    //   throw error;
    // }
  }

  async isEmailVerified(tempToken: string): Promise<BackendNormalResponse> {
    // =====================================================
    // MOCK RESPONSE
    // Remove/comment this section when backend is ready
    // =====================================================

    console.log('Mock email verification:', tempToken);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data: BackendNormalResponse = {
      success: true,
      message: 'Email Verified Successfully',
      token: null,
      emailVerified: true,
    };

    return data;
    // try {
    //   const response = await fetch(
    //     `${this.BACKEND_URL}/user/verifyEmail/${encodeURIComponent(tempToken)}`,
    //     {
    //       method: 'GET',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     },
    //   );

    //   const data: BackendNormalResponse = await response.json();
    //   if (!response.ok) {
    //     throw new Error(data.message);
    //   }

    //   return data;
    // } catch (error) {
    //   console.error('Email Verification failed: ', error);
    //   throw error;
    // }
  }
}
