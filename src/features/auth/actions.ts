"use server";

import { cookies } from 'next/headers'
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "./constants";

export const getCurrent = async () => {
    const cookieStore = await cookies()
    try {
        const seccion = cookieStore.get(AUTH_COOKIE)
        if (!seccion) return redirect("/sign-in")
        return seccion;
    } catch {
        return null;
    }
}