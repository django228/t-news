export function settingsPageTemplate({rootClass} = {}, user = {}) {
    const username = user?.username || '';
    const bio = user?.bio || '';
    const avatar = user?.avatar || '';
    
    return `
        <div class="${rootClass}">
            <h1>Настройки аккаунта</h1>
            <form class="settings-form">
                <div class="form-group">
                    <label>Имя пользователя</label>
                    <input type="text" name="username" value="${username}">
                </div>
                <div class="form-group">
                    <label>Биография</label>
                    <textarea name="bio">${bio}</textarea>
                </div>
                <div class="form-group">
                    <label>Аватар (URL)</label>
                    <input type="text" name="avatar" value="${avatar}">
                </div>
                <button type="submit">Сохранить</button>
            </form>
        </div>
    `;
}

