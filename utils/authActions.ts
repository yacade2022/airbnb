'use server'

import db from './db'
import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/auth';
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from '@/lib/password';
import {
    MAX_EMAIL_LENGTH,
    MAX_NAME_LENGTH,
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH,
    normalizeEmail,
    safeNextPath,
} from '@/lib/authRules';

// Passwords are never sent back, so the forms only restore these
type RegisterValues = { name: string; email: string };
export type RegisterField = keyof RegisterValues | 'password';
export type RegisterState = { error?: string; field?: RegisterField; values?: RegisterValues };

export type LoginState = { error?: string; values?: { email: string } };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Registration only ever creates USER accounts: any "role" field in the form is ignored, and
// admin is granted solely by scripts/make-admin.mjs
export async function registerUser(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
    const name = String(formData.get('name') ?? '').trim();
    const email = normalizeEmail(String(formData.get('email') ?? ''));
    const password = String(formData.get('password') ?? '');
    const next = safeNextPath(formData.get('next'));
    const values = { name, email };

    if (!name) return { error: 'Please enter your name.', field: 'name', values };
    if (name.length > MAX_NAME_LENGTH) {
        return { error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.`, field: 'name', values };
    }
    if (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH) {
        return { error: 'Please enter a valid email address.', field: 'email', values };
    }
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
        return {
            error: `Password must be ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters.`,
            field: 'password',
            values,
        };
    }

    try {
        await db.user.create({
            data: { name, email, passwordHash: await hashPassword(password), role: 'USER' },
        });
    } catch (error) {
        // P2002: the unique index on email
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { error: 'An account with this email already exists. Try logging in instead.', field: 'email', values };
        }
        console.error('Error registering user:', error);
        return { error: 'Something went wrong while creating your account. Please try again.', values };
    }

    // New accounts log in separately; next carries them on to where they were going (e.g. the add-home form)
    redirect(`/login?registered=1&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
}

export async function loginUser(_prevState: LoginState, formData: FormData): Promise<LoginState> {
    const email = normalizeEmail(String(formData.get('email') ?? ''));
    const password = String(formData.get('password') ?? '');
    const next = safeNextPath(formData.get('next'));
    const values = { email };

    if (!email || !password) return { error: 'Please enter your email and password.', values };
    // Too long to be a real password; checked before hashing so it can't be used to tie up the server
    if (password.length > MAX_PASSWORD_LENGTH) return { error: 'Incorrect email or password.', values };

    try {
        const user = await db.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
        // Always run the hash, and give one message for both cases, so the response doesn't reveal
        // which emails have accounts
        const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
        if (!user || !valid) return { error: 'Incorrect email or password.', values };
        await createSession(user.id);
    } catch (error) {
        console.error('Error logging in:', error);
        return { error: 'Something went wrong while logging in. Please try again.', values };
    }

    redirect(next);
}

export async function logoutUser() {
    await deleteSession();
    redirect('/');
}
