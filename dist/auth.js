import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { UnauthorizedError } from "./classes.js";
export async function hashPassword(password) {
    const hashedPassword = await argon2.hash(password);
    if (!hashedPassword)
        throw new UnauthorizedError("Can not hash password");
    return hashedPassword;
}
export async function checkPasswordHash(password, hash) {
    try {
        const isVerified = argon2.verify(hash, password);
        return isVerified;
    }
    catch {
        throw new UnauthorizedError("Failed to check password hash!?");
    }
}
export function makeJWT(userId, expiresIn, secret) {
    const currentTime = Math.floor(Date.now() / 1000);
    const expireTime = currentTime + expiresIn;
    const token = jwt.sign({
        iss: "chirpy",
        sub: userId,
        iat: currentTime,
        exp: expireTime
    }, secret);
    return token;
}
export function validateJWT(tokenString, secret) {
    let decodedPassword;
    try {
        decodedPassword = jwt.verify(tokenString, secret);
    }
    catch {
        throw new UnauthorizedError("Unable to validate password");
    }
    if (!decodedPassword.sub)
        throw new UnauthorizedError("No user ID in token");
    return decodedPassword.sub;
}
export function getBearerToken(req) {
    const token = req.get("Authorization");
    if (!token)
        throw new UnauthorizedError("Failed to authorize");
    const strippedToken = token.replace("Bearer ", "").trim();
    return strippedToken;
}
export function makeRefreshToken() {
    const randomBytes = crypto.randomBytes(32);
    const hexString = randomBytes.toString("hex");
    return hexString;
}
