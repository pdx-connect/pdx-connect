import {NextFunction, Request, Response} from "express";

/**
 * 
 * @param request
 * @param response
 * @param next
 */
export function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {
    if (request.isAuthenticated()) {
        return next();
    }
    response.redirect("/login");
}
