import passport from 'passport'

export const auth = (req, res, next) => {
  passport.authenticate(
    'current',
    { session: false },
    (error, user) => {
      if (error) {
        return next(error)
      }

      if (!user) {
        const authError = new Error('No autenticado')
        authError.statusCode = 401

        return next(authError)
      }

      req.user = user
      next()
    }
  )(req, res, next)
}