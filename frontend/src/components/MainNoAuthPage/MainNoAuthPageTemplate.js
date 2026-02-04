export function mainNoAuthPageTemplate({rootClass} = {}) {
    const className = rootClass || 'main-no-auth-page';
    return `
        <div class="${className}">
            <p style="text-align: center; padding: 40px;">Загрузка...</p>
        </div>
    `;
}

