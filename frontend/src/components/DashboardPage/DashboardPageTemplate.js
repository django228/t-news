export function dashboardPageTemplate({rootClass} = {}) {
    const className = rootClass || 'dashboard-page';
    return `
        <div class="${className}">
            <header class="dash-header">
                <div class="dash-title-block">
                    <h1 class="dash-title">Статус системы</h1>
                    <p class="dash-subtitle">REST, GraphQL, БД и клиент в одном месте</p>
                </div>
                <button type="button" class="dash-refresh" data-action="refresh" aria-label="Обновить">
                    <span class="dash-refresh-icon" data-refresh-icon>↻</span>
                    <span>Обновить</span>
                </button>
            </header>

            <div class="dash-meta">
                <span class="dash-meta-item">Обновлено: <strong data-last-sync>—</strong></span>
                <span class="dash-meta-item">API: <strong data-api-origin>—</strong></span>
            </div>

            <section class="dash-timeline" aria-label="Цепочка загрузки">
                <h2 class="dash-section-title">Цепочка загрузки</h2>
                <ol class="dash-steps" data-steps>
                    <li class="dash-step" data-step="doc"><span class="dash-step-dot"></span><span class="dash-step-label">Документ</span><span class="dash-step-detail" data-step-detail="doc">—</span></li>
                    <li class="dash-step" data-step="bundle"><span class="dash-step-dot"></span><span class="dash-step-label">Бандл и рендер</span><span class="dash-step-detail" data-step-detail="bundle">—</span></li>
                    <li class="dash-step" data-step="api"><span class="dash-step-dot"></span><span class="dash-step-label">REST API</span><span class="dash-step-detail" data-step-detail="api">—</span></li>
                    <li class="dash-step" data-step="gql"><span class="dash-step-dot"></span><span class="dash-step-label">GraphQL</span><span class="dash-step-detail" data-step-detail="gql">—</span></li>
                    <li class="dash-step" data-step="db"><span class="dash-step-dot"></span><span class="dash-step-label">База данных</span><span class="dash-step-detail" data-step-detail="db">—</span></li>
                </ol>
            </section>

            <div class="dash-grid">
                <article class="dash-card" data-card="frontend">
                    <div class="dash-card-head">
                        <span class="dash-card-icon" aria-hidden="true">◆</span>
                        <h3>Клиент (SPA)</h3>
                        <span class="dash-pill dash-pill--pending" data-status="frontend">…</span>
                    </div>
                    <dl class="dash-dl">
                        <div><dt>Версия</dt><dd data-fe-version>—</dd></div>
                        <div><dt>Базовый путь</dt><dd data-fe-base>—</dd></div>
                        <div><dt>DOM → интерактив</dt><dd data-fe-tti>—</dd></div>
                    </dl>
                </article>

                <article class="dash-card" data-card="rest">
                    <div class="dash-card-head">
                        <span class="dash-card-icon" aria-hidden="true">◇</span>
                        <h3>REST API</h3>
                        <span class="dash-pill dash-pill--pending" data-status="rest">…</span>
                    </div>
                    <dl class="dash-dl">
                        <div><dt>Мониторинг</dt><dd data-rest-latency>—</dd></div>
                        <div><dt>Ответ</dt><dd data-rest-code>—</dd></div>
                    </dl>
                </article>

                <article class="dash-card" data-card="graphql">
                    <div class="dash-card-head">
                        <span class="dash-card-icon" aria-hidden="true">⬡</span>
                        <h3>GraphQL</h3>
                        <span class="dash-pill dash-pill--pending" data-status="graphql">…</span>
                    </div>
                    <dl class="dash-dl">
                        <div><dt>Эндпоинт</dt><dd><code data-gql-path>POST /api/graphql</code></dd></div>
                        <div><dt>Задержка</dt><dd data-gql-latency>—</dd></div>
                    </dl>
                </article>

                <article class="dash-card" data-card="db">
                    <div class="dash-card-head">
                        <span class="dash-card-icon" aria-hidden="true">▣</span>
                        <h3>PostgreSQL</h3>
                        <span class="dash-pill dash-pill--pending" data-status="db">…</span>
                    </div>
                    <dl class="dash-dl">
                        <div><dt>Пользователи</dt><dd data-db-users>—</dd></div>
                        <div><dt>Посты</dt><dd data-db-posts>—</dd></div>
                    </dl>
                </article>

                <article class="dash-card dash-card--wide" data-card="monitoring">
                    <div class="dash-card-head">
                        <span class="dash-card-icon" aria-hidden="true">◎</span>
                        <h3>Трафик (сессия сервера)</h3>
                        <span class="dash-pill dash-pill--pending" data-status="monitoring">…</span>
                    </div>
                    <dl class="dash-dl dash-dl--inline">
                        <div><dt>Всего запросов</dt><dd data-mon-total>—</dd></div>
                        <div><dt>Среднее время</dt><dd data-mon-avg>—</dd></div>
                    </dl>
                    <div class="dash-recent-wrap">
                        <h4 class="dash-recent-title">Последние запросы</h4>
                        <ul class="dash-recent" data-recent-list></ul>
                    </div>
                </article>
            </div>
        </div>
    `;
}
