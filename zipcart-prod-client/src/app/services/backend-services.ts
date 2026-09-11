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
}
