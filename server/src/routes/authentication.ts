import {NextFunction, Request, Response} from "express";

const publicPaths: Set<string> = new Set();

const publicHooks: Set<(path: string) => boolean> = new Set();

/**
 * Add the given path prefix to the list of public paths.
 * @param paths The paths to register.
 */
export function registerPublicPath(...paths: string[]): void {
    for (const path of paths) {
        publicPaths.add(path);
    }
}

/**
 * Adds a hook into the public path checking.
 * @param hook The callback hook to execute.
 */
export function registerPublicHook(hook: (path: string) => boolean) {
    publicHooks.add(hook);
}

/**
 * 
 * @param request
 * @param response
 * @param next
 */
export function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {
    if (request.isAuthenticated()) {
        next();
        return;
    }
    const path: string = request.path;
    for (const publicPath of publicPaths) {
        if (path.startsWith(publicPath)) {
            next();
            return;
        }
    }
    for (const publicHook of publicHooks) {
        if (publicHook(path)) {
            next();
            return;
        }
    }
    response.redirect("/login");
}
