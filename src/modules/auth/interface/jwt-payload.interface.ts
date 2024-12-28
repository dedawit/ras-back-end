export interface JwtPayload {
  sub: string;
  email: string;
  lastRole: string;
  tokenVersion: number;
}
