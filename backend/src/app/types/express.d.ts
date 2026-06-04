export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        code: string;
        role: string;
        email: string;
      };
    }
  }
}
