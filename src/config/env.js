
const env = import.meta.env;

/** PHP (XAMPP) backend */
export const PHP_ORIGIN = env.VITE_PHP_ORIGIN || "http://localhost:8080";
export const API_PHP = env.VITE_API_PHP || "https://startuphire.businesssamadhan.in/api";

/** Laravel backend */
export const LARAVEL_ORIGIN = env.VITE_LARAVEL_ORIGIN || "http://localhost:8000";
export const API_LARAVEL = env.VITE_API_LARAVEL || `${LARAVEL_ORIGIN}/api`;
export const API_LOGOUT_URL = env.VITE_API_LOGOUT_URL || "https://startuphire.businesssamadhan.in/api/logout";
