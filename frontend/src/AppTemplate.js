import { baseUrl } from './baseUrl';

export function AppTemplate() {
    return `
        <div class="app">
            <nav class="tui-navigation">
                <div class="nav-container">
                    <div class="nav-left">
                        <img src="${baseUrl}t-bank.svg" class="logo" alt="T-Bank">
                        <div class="search-input-wrapper">
                            <input type="text" class="search-input" placeholder="Поиск по T-News">
                        </div>
                        <div class="search-type-filter" style="display:none;">
                            <button class="filter-btn active" data-type="users">Пользователи</button>
                            <button class="filter-btn" data-type="posts">Посты</button>
                        </div>
                        <a href="/dashboard" class="nav-link nav-dashboard-link">Статус</a>
                    </div>
                    <div class="nav-right" id="nav-right">
                    </div>
                </div>
            </nav>
            <main class="main-content">
                <div id="page-content"></div>
            </main>
        </div>
    `;
}
