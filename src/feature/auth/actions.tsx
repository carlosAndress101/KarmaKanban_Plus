"use server";

import { cookies } from "next/headers";
import { AUTH_COOKIE } from "./constants";

export const getCurrent = async () => {
    try {
        const seccion = (await cookies()).get(AUTH_COOKIE);
        if (!seccion) return null;
        return seccion;
    } catch {
        return null;
    }
}