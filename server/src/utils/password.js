import argon2 from 'argon2';

export const hashPassword = async (plain) => argon2.hash(plain);
export const verifyPassword = async (plain, hashed) => argon2.verify(hashed, plain);

