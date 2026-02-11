import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ApplicantDetails {
    status: string;
    applicantName: string;
    fatherName: string;
    address: string;
    hasDocuments: boolean;
    serviceOpted: string;
}
export interface ApplicationStatusResponse {
    documents: Array<ExternalBlob>;
    applicantDetails?: ApplicantDetails;
}
export interface UserProfile {
    name: string;
    email?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearDocuments(): Promise<void>;
    getAllApplications(): Promise<Array<ApplicantDetails>>;
    getApplicationByUser(user: Principal): Promise<ApplicationStatusResponse>;
    getApplicationStatus(): Promise<ApplicationStatusResponse>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitApplicantDetails(details: ApplicantDetails): Promise<void>;
    uploadApplicationDocuments(files: Array<ExternalBlob>): Promise<void>;
}
