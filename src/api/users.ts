import type { InviteBody, MeUser, PatchUserBody, PublicUser } from "../types/api";
import { apiGet, apiSend } from "./client";

export function getMe(): Promise<MeUser> {
  return apiGet<MeUser>("/users/me");
}

export function patchMe(body: {
  name?: string;
  emailOnZeroMatches?: boolean;
  phoneNumber?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  privacyAccepted?: boolean;
  notifyConsent?: boolean;
  notifyConsentAt?: string;
}): Promise<MeUser> {
  return apiSend<MeUser>("/users/me", "PATCH", body);
}

export function listUsers(): Promise<PublicUser[]> {
  return apiGet<PublicUser[]>("/users");
}

export function getUser(userId: string): Promise<PublicUser> {
  return apiGet<PublicUser>(`/users/${encodeURIComponent(userId)}`);
}

export function patchUser(userId: string, body: PatchUserBody): Promise<PublicUser> {
  return apiSend<PublicUser>(`/users/${encodeURIComponent(userId)}`, "PATCH", body);
}

export function inviteUser(body: InviteBody): Promise<PublicUser> {
  return apiSend<PublicUser>("/users/invite", "POST", body);
}

export function deleteUser(userId: string): Promise<{ userId: string }> {
  return apiSend<{ userId: string }>(`/users/${encodeURIComponent(userId)}`, "DELETE");
}
