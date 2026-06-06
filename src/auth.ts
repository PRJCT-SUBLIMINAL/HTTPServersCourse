import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import type {JwtPayload} from "jsonwebtoken";

export async function hashPassword(password: string): Promise<string> {
    const hashedPassword = await argon2.hash(password);
    if (!hashedPassword) throw new Error("Can not hash password");
    return hashedPassword;
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    try {
        return argon2.verify(hash, password);
    } catch {
        throw new Error("Failed to check password hash!?");
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
        throw new Error("Unable to validate password");
    }

    if (!decodedPassword.sub) throw new Error("No user ID in token");
    
    return decodedPassword.sub;
}