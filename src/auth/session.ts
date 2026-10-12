import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  type CognitoUserSession,
  type ISignUpResult,
} from "amazon-cognito-identity-js";
import { getUserPool } from "./cognito";
import { groupsFromIdToken, isAdminFromGroups } from "./groups";

export type SignInResult =
  | { kind: "authenticated"; session: CognitoUserSession }
  | { kind: "newPasswordRequired" };

export interface SignUpParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string; // E.164 format: +1XXXXXXXXXX
}

let pendingNewPasswordUser: CognitoUser | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function cognitoUser(email: string): CognitoUser {
  return new CognitoUser({
    Username: normalizeEmail(email),
    Pool: getUserPool(),
  });
}

function asError(error: unknown, fallback: string): Error {
  if (error instanceof Error && error.message) {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: string }).message || fallback);
    const name = String((error as { name?: string; code?: string }).name || (error as { code?: string }).code || "");
    const wrapped = new Error(message);
    wrapped.name = name || wrapped.name;
    return wrapped;
  }
  return new Error(fallback);
}

export function mapSignInError(error: unknown): string {
  const err = asError(error, "Sign-in failed");
  if (err.name === "NotAuthorizedException" || /incorrect username or password/i.test(err.message)) {
    return "Email or password is wrong.";
  }
  if (/network|failed to fetch|timeout/i.test(err.message)) {
    return "Cannot reach Cognito.";
  }
  return err.message || "Sign-in failed.";
}

export function mapSignUpError(error: unknown): string {
  const err = asError(error, "Sign-up failed");
  if (err.name === "UsernameExistsException" || /user already exists/i.test(err.message)) {
    return "An account with this email address already exists. Please sign in or reset your password.";
  }
  if (err.name === "InvalidPasswordException") {
    return "Password must be at least 10 characters and contain uppercase, lowercase, numbers, and symbols.";
  }
  if (err.name === "InvalidParameterException") {
    if (/phone/i.test(err.message)) {
      return "Invalid phone number format. Please provide a valid 10-digit US number.";
    }
    return err.message;
  }
  if (err.name === "CodeMismatchException") {
    return "Invalid verification code. Please check your email and try again.";
  }
  if (err.name === "ExpiredCodeException") {
    return "This verification code has expired. Please click 'Resend OTP' to receive a new code.";
  }
  if (err.name === "LimitExceededException") {
    return "Too many attempts. Please wait a few moments before trying again.";
  }
  if (/network|failed to fetch|timeout/i.test(err.message)) {
    return "Cannot reach Cognito. Please check your internet connection.";
  }
  return err.message || "Sign-up failed.";
}

export function signUp(params: SignUpParams): Promise<ISignUpResult> {
  const pool = getUserPool();
  const email = normalizeEmail(params.email);
  const firstName = params.firstName.trim();
  const lastName = params.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();

  const attributeList: CognitoUserAttribute[] = [
    new CognitoUserAttribute({ Name: "email", Value: email }),
    new CognitoUserAttribute({ Name: "name", Value: fullName }),
    new CognitoUserAttribute({ Name: "given_name", Value: firstName }),
    new CognitoUserAttribute({ Name: "family_name", Value: lastName }),
    new CognitoUserAttribute({ Name: "phone_number", Value: params.phoneNumber }),
  ];

  return new Promise((resolve, reject) => {
    pool.signUp(email, params.password, attributeList, [], (error, result) => {
      if (error || !result) {
        reject(asError(error, "Registration failed"));
        return;
      }
      resolve(result);
    });
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  const user = cognitoUser(email);
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code.trim(), true, (error) => {
      if (error) {
        reject(asError(error, "Confirmation failed"));
        return;
      }
      resolve();
    });
  });
}

export function resendConfirmationCode(email: string): Promise<void> {
  const user = cognitoUser(email);
  return new Promise((resolve, reject) => {
    user.resendConfirmationCode((error) => {
      if (error) {
        reject(asError(error, "Failed to resend confirmation code"));
        return;
      }
      resolve();
    });
  });
}

export function signIn(email: string, password: string): Promise<SignInResult> {
  const user = cognitoUser(email);
  const details = new AuthenticationDetails({
    Username: normalizeEmail(email),
    Password: password,
  });
  return new Promise((resolve, reject) => {
    user.authenticateUser(details, {
      onSuccess(session) {
        pendingNewPasswordUser = null;
        resolve({ kind: "authenticated", session });
      },
      onFailure(error) {
        reject(asError(error, "Sign-in failed"));
      },
      newPasswordRequired() {
        pendingNewPasswordUser = user;
        resolve({ kind: "newPasswordRequired" });
      },
    });
  });
}

export function hasPendingNewPassword(): boolean {
  return pendingNewPasswordUser !== null;
}

export function completeNewPassword(password: string): Promise<CognitoUserSession> {
  const user = pendingNewPasswordUser;
  if (!user) {
    return Promise.reject(new Error("Start from sign-in."));
  }
  return new Promise((resolve, reject) => {
    user.completeNewPasswordChallenge(
      password,
      {},
      {
        onSuccess(session) {
          pendingNewPasswordUser = null;
          resolve(session);
        },
        onFailure(error) {
          reject(asError(error, "Could not set password"));
        },
      },
    );
  });
}

export function getCurrentUser(): CognitoUser | null {
  return getUserPool().getCurrentUser();
}

export function getSession(): Promise<CognitoUserSession> {
  const user = getCurrentUser();
  if (!user) {
    return Promise.reject(new Error("Not signed in"));
  }
  return new Promise((resolve, reject) => {
    user.getSession((error: Error | null, session: CognitoUserSession | null) => {
      if (error || !session?.isValid()) {
        reject(asError(error, "Invalid session"));
        return;
      }
      resolve(session);
    });
  });
}

export async function getIdToken(): Promise<string> {
  const session = await getSession();
  return session.getIdToken().getJwtToken();
}

export async function getGroups(): Promise<string[]> {
  try {
    const token = await getIdToken();
    return groupsFromIdToken(token);
  } catch {
    return [];
  }
}

export async function isAdmin(): Promise<boolean> {
  return isAdminFromGroups(await getGroups());
}

export function signOut(): Promise<void> {
  pendingNewPasswordUser = null;
  const user = getCurrentUser();
  if (!user) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    user.globalSignOut({
      onSuccess() {
        user.signOut();
        resolve();
      },
      onFailure() {
        user.signOut();
        resolve();
      },
    });
  });
}

export function forgotPassword(email: string): Promise<void> {
  const user = cognitoUser(email);
  return new Promise((resolve) => {
    user.forgotPassword({
      onSuccess() {
        resolve();
      },
      onFailure() {
        resolve();
      },
    });
  });
}

export function confirmForgotPassword(email: string, code: string, password: string): Promise<void> {
  const user = cognitoUser(email);
  return new Promise((resolve, reject) => {
    user.confirmPassword(code.trim(), password, {
      onSuccess() {
        resolve();
      },
      onFailure(error) {
        reject(asError(error, "Could not reset password"));
      },
    });
  });
}
