export function signupPageTemplate({rootClass} = {}) {
    return `
        <div class="${rootClass}">
            <div class="auth-header">
                <img src="/t-bank.svg" class="logo" alt="T-Bank">
            </div>
            <div class="signup-card">
                <div class="card-header">
                    <h2>Регистрация</h2>
                </div>
                <div class="card-content">
                    <form class="signup-form">
                        <div class="input-group">
                            <label>Логин</label>
                            <input type="text" name="username" placeholder="Введите логин" required>
                        </div>
                        <div class="input-group">
                            <label>Пароль</label>
                            <input type="password" name="password" placeholder="Введите пароль" required>
                        </div>
                        <div class="input-group">
                            <label>Повторите пароль</label>
                            <input type="password" name="confirmPassword" placeholder="Повторите пароль" required>
                        </div>
                    </form>
                </div>
                <div class="card-footer">
                    <a href="/login" class="btn-secondary btn-login">Войти</a>
                    <button type="submit" class="btn-primary signup-submit">Зарегистрироваться</button>
                </div>
            </div>
        </div>
    `;
}

