export function RouterService() {
    let currentRoute = window.location.hash.slice(1) || '/';
    let listeners = [];

    function navigate(path) {
        currentRoute = path;
        window.location.hash = path;
        listeners.forEach(fn => fn(path));
    }

    function getCurrentRoute() {
        return currentRoute;
    }

    function subscribe(listener) {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(fn => fn !== listener);
        };
    }

    window.addEventListener('hashchange', () => {
        currentRoute = window.location.hash.slice(1) || '/';
        listeners.forEach(fn => fn(currentRoute));
    });

    return {
        navigate,
        getCurrentRoute,
        subscribe,
    };
}

