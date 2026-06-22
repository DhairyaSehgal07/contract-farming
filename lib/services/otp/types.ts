export type OtpPurpose = "lot-receipt";

export type SendOtpContext = {
  purpose: OtpPurpose;
  referenceId: string;
  mobileNumber: string;
};

export type SendOtpResult = {
  expiresAt: Date;
  /** Present only when using the mock provider in development */
  devOtp?: string;
};

export type OtpProvider = {
  sendOtp(context: SendOtpContext): Promise<SendOtpResult>;
  verifyOtp(context: SendOtpContext, code: string): Promise<boolean>;
};
