export function loginPageTemplate({rootClass} = {}) {
    return `
        <div class="${rootClass}">
            <div class="auth-header">
                <img src="/t-bank.svg" class="logo" alt="T-Bank">
            </div>
            <div class="login-card">
                <div class="card-header">
                    <h2>Вход</h2>
                </div>
                <div class="card-content">
                    <form class="login-form">
                        <div class="input-group">
                            <label>Логин</label>
                            <input type="text" name="username" placeholder="Введите логин" required>
                        </div>
                        <div class="input-group">
                            <label>Пароль</label>
                            <input type="password" name="password" placeholder="Введите пароль" required>
                        </div>
                    </form>
                </div>
                <div class="card-footer">
                    <a href="/signup" class="btn-secondary">Зарегистрироваться</a>
                    <button type="submit" class="btn-primary login-submit">Войти</button>
                </div>
            </div>
        </div>
    `;
}
