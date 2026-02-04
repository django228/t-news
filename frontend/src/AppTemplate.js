export function AppTemplate() {
    return `
        <div class="app">
            <nav class="tui-navigation">
                <div class="nav-container">
                    <div class="nav-left">
                        <img src="/t-bank.svg" class="logo" alt="T-Bank">
                        <div class="search-input-wrapper">
                            <input type="text" class="search-input" placeholder="Поиск по T-News">
                        </div>
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
