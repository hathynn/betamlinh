export type ProviderErrorCode = "not_configured" | "upstream_error" | "timeout" | "invalid_response" | "quota_exceeded";

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  constructor(code: ProviderErrorCode, message: string) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
  }
}
