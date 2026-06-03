// STATUS 400
export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
    };
};

// STATUS 401
export class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
    };
};

// STATUS 403
export class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
    };
};

// STATUS 404
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
    };
};

// .env Error
export class EnvironmentError extends Error {
    constructor(message: string) {
        super(message);
    };
};