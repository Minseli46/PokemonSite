import { Request, Response, NextFunction } from 'express';

/**
 * Middleware d'authentification (simplifié)
 * Dans une vraie application, cela vérifierait les tokens Firebase
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Récupère le token depuis le header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Unauthorized - No token provided',
          status: 401,
        },
      });
    }

    const token = authHeader.substring(7);

    // TODO: Vérifier le token avec Firebase Admin SDK
    // Pour l'instant, on simule juste la vérification
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Unauthorized - Invalid token',
          status: 401,
        },
      });
    }

    // Ajoute l'utilisateur au request
    // req.user = decodedToken;

    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        message: 'Unauthorized - Token verification failed',
        status: 401,
      },
    });
  }
};

/**
 * Middleware optionnel d'authentification
 * Continue même si l'authentification échoue
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // TODO: Vérifier le token avec Firebase Admin SDK
      // req.user = decodedToken;
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue quand même
    next();
  }
};
