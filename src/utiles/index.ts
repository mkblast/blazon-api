import { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";

export function validateId(req: Request, res: Response, next: NextFunction) {
    for (const key in req.params) {
        const isValidId = isValidObjectId(req.params[key]);
        if (isValidId === false) {
            return res.status(404).json({
                status: "Query failed.",
                errors: [{
                    msg: "not a valid Id."
                }],
            });
        }
    }

    next();
}
