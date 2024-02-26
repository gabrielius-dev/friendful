export type InitialErrors =
  | { email?: string[]; password?: string[]; fullName?: string[] }
  | string
  | undefined;
