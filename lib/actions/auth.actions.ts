'use server'

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;
    try {
        const userRecord = await db.collection('users').doc(uid).get();

        if (userRecord.exists) {
            return {
                success: false,
                message: "User already exists. Please sign-in instead."
            }
        }

        await db.collection("users").doc(uid).set({
            name,
            email
        })

        return {
            success: true,
            message: "Account created successfully. Please sign in."
        }
    } catch (error: any) {
        console.error(`Error creating an user: ${error}`);

        if (error.code === "auth/email-already-exists") {
            return {
                success: false,
                message: "This email is already in use."
            }
        }

        return {
            success: false,
            message: "Failed to create an account."
        }
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieExpirationTime = 60 * 60 * 24 * 7 * 1000 // = 1 week

    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: cookieExpirationTime
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: cookieExpirationTime,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: "/",
        sameSite: 'lax'
    });
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;
    try {
        const userRecord = await auth.getUserByEmail(email);

        if (!userRecord) {
            return {
                success: false,
                message: "User doesn't exist. Create an account instead."
            }
        }

        await setSessionCookie(idToken);

        return {
            success: true,
            message: "Successfully logged in."
        }
    } catch (error: any) {
        console.error(`Error signing in: ${error}`);

        return {
            success: false,
            message: "Failed to sign up."
        }
    }
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) return null;
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const userEmail = decodedClaims.email;

        if (!userEmail) return null;

        const userRecord = await db.collection("users").doc(decodedClaims.uid).get();

        if (!userRecord.exists) return null;

        return {
            ...userRecord.data(),
            id: userRecord.id
        } as User;
    } catch (error) {
        console.error(error)
        return null;
    }
}

export async function isAuthenticated() {
    const user = await getCurrentUser();

    return !!user;
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db.collection("interviews")
                        .where('userId', '==', userId)
                        .orderBy('createdAt', 'desc')
                        .get();

    return interviews.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[]
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const interviews = await db.collection("interviews")
                        .where('finalized', '==', true)
                        .where('userId', '!=', userId)
                        .orderBy('createdAt', 'desc')
                        .limit(limit)
                        .get();

    return interviews.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[]
}
