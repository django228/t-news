import pkg from '../../package.json';

export function ApiService() {
    const apiUrl = pkg.config.api_url;
    let token = localStorage.getItem('token');

    function setToken(newToken) {
        token = newToken;
        if (newToken) {
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
        }
    }

    function getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    function get(url) {
        return fetch(`${apiUrl}/${url}`, {
            headers: getHeaders(),
        }).then(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        });
    }

    function post(url, data) {
        return fetch(`${apiUrl}/${url}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        });
    }

    function patch(url, data) {
        return fetch(`${apiUrl}/${url}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        });
    }

    function del(url) {
        return fetch(`${apiUrl}/${url}`, {
            method: 'DELETE',
            headers: getHeaders(),
        }).then(async res => {
            if (!res.ok) throw new Error(res.statusText);
            if (res.status === 204) return null;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const text = await res.text();
                return text ? JSON.parse(text) : null;
            }
            return null;
        });
    }

    return {
        get,
        post,
        patch,
        delete: del,
        setToken,
        getToken: () => token,
    };
}
