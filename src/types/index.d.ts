declare namespace Express {
    export interface User {
        _id: string;
        email: string;
        name: string;
        password: string;
        about: string;
        date: Date,
        following: string[]
    }
}

interface ResError extends Error {
    messages?: string;
    status?: number;
}
