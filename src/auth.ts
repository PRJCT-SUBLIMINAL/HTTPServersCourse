import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import type {JwtPayload} from "jsonwebtoken";
import type {Request} from "express";
import { UnauthorizedError } from "./classes.js";

export async function hashPassword(password: string): Promise<string> {
    const hashedPassword = await argon2.hash(password);
    if (!hashedPassword) throw new UnauthorizedError("Can not hash password");
    return hashedPassword;
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    try {
        const isVerified = argon2.verify(hash, password);
        return isVerified;
    } catch {
        throw new UnauthorizedError("Failed to check password hash!?");
    }
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp" >;

export function makeJWT(userId: string, expiresIn: number, secret: string): string {
    const currentTime = Math.floor(Date.now() / 1000);
    const expireTime = currentTime + expiresIn;

    const token = jwt.sign({
        iss: "chirpy",
        sub: userId,
        iat: currentTime,
        exp: expireTime
    } satisfies payload, secret);

    return token;
}

export function validateJWT(tokenString: string, secret: string): string {
    let decodedPassword: JwtPayload;
    try {
        decodedPassword = jwt.verify(tokenString, secret) as JwtPayload;
    } catch {
        throw new UnauthorizedError("Unable to validate password");
    }

    if (!decodedPassword.sub) throw new UnauthorizedError("No user ID in token");
    
    return decodedPassword.sub;
}

export function getBearerToken(req: Request): string {
    const token = req.get("Authorization");
    if (!token) throw new UnauthorizedError("Failed to authorize");
    const strippedToken = token.replace("Bearer ", "").trim();
    return strippedToken;
}

export function makeRefreshToken(): string {
    const randomBytes = crypto.randomBytes(32);
    const hexString = randomBytes.toString("hex");
    return hexString;
}