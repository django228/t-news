export function feedPageTemplate({rootClass} = {}) {
    const className = rootClass || 'feed-page';
    return `
        <div class="${className}">
            <p style="text-align: center; padding: 40px;">Загрузка...</p>
        </div>
    `;
}

