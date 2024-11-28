import { defineMiddleware } from "astro:middleware";
import { API_BASE_URL } from '@/config/config.ts';

const privateRoutes = [ 
    '/library',
    '/profile',
];

// Función para redirigir a la página de inicio de sesión
const redirectToLogin = () => {
    return new Response(null, { 
        status: 302,
        headers: {
            'Location': '/login',
        }
    });
};

// `context` y `next` son automáticamente tipados
export const onRequest = defineMiddleware(async (context, next) => {

    const { url, request, locals, cookies } = context;

    // Obtener el token de las cookies
    const token = cookies.get('token')?.value;

    // TODO: Eliminar
    console.log({ token });

    if (token) {
        try {
            console.log('Token found, verifying with backend...');
            // Verificar el token con el backend
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
            });

            if (response.ok) {
                console.log('Token is valid.');
                const userData = await response.json();
                locals.user = userData;
                locals.isLoggedIn = true;
            } else {
                console.log('Token is invalid.');
                locals.isLoggedIn = false;
                locals.user = null;
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            locals.isLoggedIn = false;
            locals.user = null;
        }
    } else {
        locals.isLoggedIn = false;
        locals.user = null;
    }

    if (privateRoutes.includes(url.pathname) && !locals.isLoggedIn) {
        // Redirigir a la página de inicio de sesión si el token no es válido o no está presente
        return redirectToLogin();
    }

    console.log('Middleware ejecutado', locals);
    
    // devuelve una respuesta o el resultado de llamar a `next()`.
    // Continuar con la solicitud si la ruta no es privada
    return next();
});
