export interface BackendNormalResponse {
  success: boolean;
  message: string;
  token: string | null;
  emailVerified: boolean | null;
}
