import { inject } from '@/di/di';
import { SERVICES } from './utils';

export function AuthService() {
    const apiService = inject(SERVICES.ApiService);

    async function login(username, password) {
        const response = await apiService.post('auth/login', { username, password });
        apiService.setToken(response.access_token);
        return response.user;
    }

    async function register(username, password) {
        const response = await apiService.post('auth/register', { username, password });
        apiService.setToken(response.access_token);
        return response.user;
    }

    function logout() {
        apiService.setToken(null);
    }

    function isAuthenticated() {
        return !!apiService.getToken();
    }

    return {
        login,
        register,
        logout,
        isAuthenticated,
    };
}

