export function profilePageTemplate({rootClass} = {}, user = {}, posts = [], isOwnProfile = false, isFollowing = false) {
    const username = user?.username || 'Загрузка...';
    const bio = user?.bio || '';
    let avatar = user?.avatar || '/Master.svg';
    if (avatar && avatar !== '/Master.svg' && !avatar.startsWith('http') && !avatar.startsWith('/uploads')) {
        avatar = `http://localhost:3000${avatar}`;
    } else if (avatar && avatar.startsWith('/uploads')) {
        avatar = `http://localhost:3000${avatar}`;
    }
    
    const postsHtml = posts.length > 0 
        ? posts.map(post => {
            const likesCount = post.likes?.length || 0;
            const commentsCount = post.comments?.length || 0;
            return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-content">${post.content || ''}</div>
                <div class="post-footer">
                    <div class="post-stats">
                        <span class="likes-count">${likesCount} лайков</span>
                        <span class="comments-count">${commentsCount} комментариев</span>
                    </div>
                    ${isOwnProfile ? `<button class="delete-post-btn" data-post-id="${post.id}">Удалить</button>` : ''}
                </div>
            </div>
        `;
        }).join('')
        : '<p class="no-posts">Нет постов</p>';
    
    return `
        <div class="${rootClass}">
            <div class="profile-header">
                <div class="avatar-container">
                    <img src="${avatar.startsWith('http') || avatar.startsWith('/') ? avatar : `http://localhost:3000${avatar}`}" class="profile-avatar" alt="Avatar" onerror="this.src='/Master.svg'">
                    ${isOwnProfile ? `
                        <label class="change-avatar-btn">
                            <input type="file" accept="image/*" class="avatar-input" style="display: none;">
                            <span>Изменить фото</span>
                        </label>
                    ` : ''}
                </div>
                <div class="profile-info">
                    ${isOwnProfile ? `
                        <input type="text" class="profile-username-input" value="${username}" placeholder="Имя пользователя">
                        <textarea class="profile-bio-input" placeholder="Описание">${bio}</textarea>
                        <button class="save-profile-btn">Сохранить</button>
                    ` : `
                        <h1 class="profile-username">${username}</h1>
                        <p class="profile-bio">${bio || 'Нет описания'}</p>
                        <button class="follow-btn ${isFollowing ? 'following' : ''}">${isFollowing ? 'Отписаться' : 'Подписаться'}</button>
                    `}
                </div>
            </div>
            ${isOwnProfile ? `
                <div class="create-post-section">
                    <textarea class="post-input" placeholder="Введите свой пост"></textarea>
                    <button class="create-post-btn">Отправить</button>
                </div>
            ` : ''}
            <div class="posts-section">
                <h2>Посты</h2>
                ${postsHtml}
            </div>
        </div>
    `;
}
