export function searchPageTemplate({rootClass} = {}, results = [], searchType = 'users', query = '') {
    const resultsHtml = results.length > 0
        ? results.map(result => {
            if (result.username) {
                let avatarUrl = result.avatar || '/Master.svg';
                if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/') && avatarUrl !== '/Master.svg') {
                    avatarUrl = `http://localhost:3000${avatarUrl}`;
                } else if (avatarUrl && avatarUrl.startsWith('/uploads')) {
                    avatarUrl = `http://localhost:3000${avatarUrl}`;
                }
                return `
                    <div class="search-user-card" data-user-id="${result.id}" style="cursor: pointer;">
                        <img src="${avatarUrl}" class="user-avatar" alt="Avatar" onerror="this.src='/Master.svg'">
                        <div class="user-info">
                            <div class="user-name">${result.username}</div>
                            ${result.bio ? `<div class="user-bio">${result.bio}</div>` : ''}
                        </div>
                    </div>
                `;
            } else {
                let avatarUrl = result.user?.avatar || '/Master.svg';
                if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/') && avatarUrl !== '/Master.svg') {
                    avatarUrl = `http://localhost:3000${avatarUrl}`;
                } else if (avatarUrl && avatarUrl.startsWith('/uploads')) {
                    avatarUrl = `http://localhost:3000${avatarUrl}`;
                }
                return `
                    <div class="search-post-card" data-post-id="${result.id}">
                        <div class="post-header">
                            <img src="${avatarUrl}" class="post-avatar" alt="Avatar" onerror="this.src='/Master.svg'" data-user-id="${result.userId || result.user?.id}" style="cursor: pointer;">
                            <div class="post-author" data-user-id="${result.userId || result.user?.id}" style="cursor: pointer;">${result.user?.username || 'User'}</div>
                        </div>
                        <div class="post-content">${result.content || ''}</div>
                    </div>
                `;
            }
        }).join('')
        : (query ? '<p style="text-align: center; padding: 40px;">Ничего не найдено</p>' : '<p style="text-align: center; padding: 40px;">Введите запрос для поиска</p>');
    
    return `
        <div class="${rootClass}">
            <div class="search-header">
                <input type="text" class="search-input" value="${query}" placeholder="Поиск по T-News">
                <select class="type-toggle">
                    <option value="users" ${searchType === 'users' ? 'selected' : ''}>Пользователи</option>
                    <option value="posts" ${searchType === 'posts' ? 'selected' : ''}>Посты</option>
                </select>
            </div>
            <div class="search-results">
                ${resultsHtml}
            </div>
        </div>
    `;
}

