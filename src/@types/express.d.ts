import { Request } from 'express';
<<<<<<< HEAD
=======

>>>>>>> origin/main
declare module 'express-serve-static-core' {
  interface Request {
    user?: { userId: string };
  }
}
