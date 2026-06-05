import * as argon2 from "argon2";
export async function checkPasswordHash(password, hash) {
    try {
        return argon2.verify(hash, password);
    }
    catch (err) {
        throw new Error("Failed to check password hash!?");
    }
}
export async function hashPassword(password) {
    const hashedPassword = await argon2.hash(password);
    if (!hashedPassword)
        throw new Error("Can not hash password");
    return hashedPassword;
}
