// TODO: Revisar
/// <reference types="astro/client" />
/// <reference types="astro/middleware" />

interface User {
    name: string;
    email: string;
}

declare namespace App {
    interface Locals {
        isLoggedIn: boolean,
        user: User | null,
    }
}