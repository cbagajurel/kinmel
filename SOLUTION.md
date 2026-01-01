# Express + Swagger Quick Fixes

## "Failed to fetch" / CORS in Swagger UI

| Issue | Solution |
|-------|----------|
| Unhandled validation error | Wrap async code in try-catch, use `next(error)` |
| Wrong Swagger basePath | Add `basePath: "/api"` in swagger.js, regenerate docs |
| Missing CORS middleware | Add `app.use(cors())` before routes |
| Server crashing silently | Add global error handler middleware |

## Swagger Not Hitting Routes

| Issue | Solution |
|-------|----------|
| Wrong basePath | Match basePath in swagger.js to your route prefix |
| Outdated docs | Run `npm run auth-docs` to regenerate |
| Wrong port/host | Update `host: "localhost:PORT"` in swagger.js |

## Validation Errors Breaking API

| Issue | Solution |
|-------|----------|
| Missing fields cause crash | Validate before using, throw custom ValidationError |
| Error not returned to client | Use error middleware to send JSON response |
