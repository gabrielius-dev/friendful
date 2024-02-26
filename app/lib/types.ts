export type InitialErrors =
  | { email?: string[]; password?: string[]; fullName?: string[] }
  | string
  | undefined;

export class CustomAuthError extends Error {
  constructor(public data: InitialErrors, message?: string) {
    super(message);
    this.name = "CustomAuthError";
  }
}
