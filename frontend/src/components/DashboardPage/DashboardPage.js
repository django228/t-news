import {SandyElement} from '@/index';
import DashboardPageStyles from './DashboardPage.scss?inline';
import {dashboardPageTemplate} from './DashboardPageTemplate';
import {apiOrigin, baseUrl, graphqlHttpUrl} from '@/baseUrl';
import pkg from '../../../package.json';

export class DashboardPage extends SandyElement {
    static rootClass = 'dashboard-page';
    pollId = null;

    constructor() {
        super(DashboardPageStyles, dashboardPageTemplate.bind(null, {rootClass: DashboardPage.rootClass}));
    }

    onReady() {
        const root = this.shadowRoot;
        const btn = root.querySelector('[data-action="refresh"]');
        if (btn) {
            btn.addEventListener('click', () => this.refresh());
        }
        this.applyFrontendStatic();
        void this.refresh();
        this.pollId = window.setInterval(() => this.refresh(), 15000);
    }

    onDisconnect() {
        if (this.pollId != null) {
            window.clearInterval(this.pollId);
            this.pollId = null;
        }
    }

    applyFrontendStatic() {
        const root = this.shadowRoot;
        const nav = performance.getEntriesByType('navigation')[0];
        let tti = '—';
        if (nav && nav.domInteractive > 0 && nav.fetchStart > 0) {
            tti = `${Math.round(nav.domInteractive - nav.fetchStart)} мс`;
        }
        const feVersion = root.querySelector('[data-fe-version]');
        const feBase = root.querySelector('[data-fe-base]');
        const feTti = root.querySelector('[data-fe-tti]');
        const apiEl = root.querySelector('[data-api-origin]');
        if (feVersion) feVersion.textContent = pkg.version || '0.0.0';
        if (feBase) feBase.textContent = baseUrl;
        if (feTti) feTti.textContent = tti;
        if (apiEl) apiEl.textContent = apiOrigin;
        this.setPill(root, 'frontend', 'ok', 'готов');
        this.setStep(root, 'doc', 'done', 'HTML получен');
        this.setStep(root, 'bundle', 'done', tti !== '—' ? `интерактив за ${tti}` : 'интерактив');
    }

    setPill(root, key, state, text) {
        const el = root.querySelector(`[data-status="${key}"]`);
        if (!el) return;
        el.textContent = text;
        el.className = 'dash-pill';
        if (state === 'ok') el.classList.add('dash-pill--ok');
        else if (state === 'err') el.classList.add('dash-pill--err');
        else el.classList.add('dash-pill--pending');
    }

    setStep(root, step, state, detail) {
        const li = root.querySelector(`[data-step="${step}"]`);
        const det = root.querySelector(`[data-step-detail="${step}"]`);
        if (det) det.textContent = detail;
        if (!li) return;
        li.classList.remove('is-done', 'is-active', 'is-error');
        if (state === 'done') li.classList.add('is-done');
        else if (state === 'active') li.classList.add('is-active');
        else if (state === 'error') li.classList.add('is-error');
    }

    async refresh() {
        const root = this.shadowRoot;
        const icon = root.querySelector('[data-refresh-icon]');
        const lastSync = root.querySelector('[data-last-sync]');
        if (icon) {
            icon.classList.remove('is-spinning');
            void icon.offsetWidth;
            icon.classList.add('is-spinning');
        }

        this.setPill(root, 'rest', 'pending', '…');
        this.setPill(root, 'graphql', 'pending', '…');
        this.setPill(root, 'db', 'pending', '…');
        this.setPill(root, 'monitoring', 'pending', '…');
        this.setStep(root, 'api', 'active', 'проверка…');
        this.setStep(root, 'gql', 'pending', 'ожидание');
        this.setStep(root, 'db', 'pending', 'ожидание');

        const t0 = performance.now();
        let restMs = null;
        let restOk = false;
        let dbUsers = null;
        let dbPosts = null;
        let stats = null;
        let gqlMs = null;
        let gqlOk = false;

        try {
            const restUrl = `${apiOrigin}/api/monitoring/db-counts`;
            const r0 = performance.now();
            const res = await fetch(restUrl, {method: 'GET', headers: {'Accept': 'application/json'}});
            restMs = Math.round(performance.now() - r0);
            restOk = res.ok;
            if (res.ok) {
                const data = await res.json();
                dbUsers = data.users;
                dbPosts = data.posts;
            }
        } catch {
            restOk = false;
        }

        const restCodeEl = root.querySelector('[data-rest-code]');
        const restLat = root.querySelector('[data-rest-latency]');
        if (restLat) restLat.textContent = restMs != null ? `${restMs} мс` : '—';
        if (restCodeEl) restCodeEl.textContent = restOk ? '200 OK' : 'ошибка';

        if (restOk) {
            this.setPill(root, 'rest', 'ok', 'онлайн');
            this.setStep(root, 'api', 'done', restMs != null ? `${restMs} мс` : 'OK');
        } else {
            this.setPill(root, 'rest', 'err', 'недоступен');
            this.setStep(root, 'api', 'error', 'нет ответа');
        }

        try {
            const g0 = performance.now();
            let gRes = await fetch(graphqlHttpUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query: '{ __typename }'}),
            });
            if (!gRes.ok) {
                gRes = await fetch(`${apiOrigin}/graphql`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({query: '{ __typename }'}),
                });
            }
            gqlMs = Math.round(performance.now() - g0);
            const gqlJson = gRes.ok ? await gRes.json().catch(() => null) : null;
            gqlOk =
                gRes.ok &&
                gqlJson &&
                (!gqlJson.errors || gqlJson.errors.length === 0) &&
                gqlJson.data !== undefined;
        } catch {
            gqlOk = false;
        }

        const gqlLat = root.querySelector('[data-gql-latency]');
        if (gqlLat) gqlLat.textContent = gqlMs != null ? `${gqlMs} мс` : '—';
        if (gqlOk) {
            this.setPill(root, 'graphql', 'ok', 'онлайн');
            this.setStep(root, 'gql', 'done', gqlMs != null ? `${gqlMs} мс` : 'OK');
        } else {
            this.setPill(root, 'graphql', 'err', 'ошибка');
            this.setStep(root, 'gql', 'error', 'нет ответа');
        }

        if (dbUsers != null && dbPosts != null) {
            this.setPill(root, 'db', 'ok', 'данные');
            const u = root.querySelector('[data-db-users]');
            const p = root.querySelector('[data-db-posts]');
            if (u) u.textContent = String(dbUsers);
            if (p) p.textContent = String(dbPosts);
            this.setStep(root, 'db', 'done', `${dbUsers} польз. · ${dbPosts} постов`);
        } else if (restOk) {
            this.setPill(root, 'db', 'err', 'нет данных');
            this.setStep(root, 'db', 'error', 'счётчики недоступны');
        } else {
            this.setPill(root, 'db', 'err', '—');
            this.setStep(root, 'db', 'error', 'недоступно');
        }

        try {
            const sRes = await fetch(`${apiOrigin}/api/monitoring/stats`, {headers: {'Accept': 'application/json'}});
            if (sRes.ok) {
                stats = await sRes.json();
            }
        } catch {
            stats = null;
        }

        const monTotal = root.querySelector('[data-mon-total]');
        const monAvg = root.querySelector('[data-mon-avg]');
        const recentList = root.querySelector('[data-recent-list]');

        if (stats && typeof stats.totalRequests === 'number') {
            this.setPill(root, 'monitoring', 'ok', 'активен');
            if (monTotal) monTotal.textContent = String(stats.totalRequests);
            if (monAvg) {
                monAvg.textContent =
                    stats.averageResponseTime != null ? `${stats.averageResponseTime} мс` : '—';
            }
            if (recentList && Array.isArray(stats.recentRequests)) {
                recentList.innerHTML = stats.recentRequests
                    .slice(0, 12)
                    .map(
                        (req) => `
                    <li>
                        <span class="r-method">${escapeHtml(req.method || '')}</span>
                        <span class="r-path" title="${escapeHtml(req.path || '')}">${escapeHtml(trunc(req.path, 42))}</span>
                        <span class="r-code">${escapeHtml(String(req.statusCode ?? ''))}</span>
                        <span class="r-ms">${req.duration != null ? `${req.duration} мс` : '—'}</span>
                    </li>`,
                    )
                    .join('');
            }
        } else {
            this.setPill(root, 'monitoring', 'err', 'нет данных');
            if (monTotal) monTotal.textContent = '—';
            if (monAvg) monAvg.textContent = '—';
            if (recentList) recentList.innerHTML = '';
        }

        if (lastSync) {
            lastSync.textContent = new Date().toLocaleString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
            });
        }

        if (icon) {
            window.setTimeout(() => icon.classList.remove('is-spinning'), 480);
        }
    }
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function trunc(s, n) {
    const str = String(s);
    return str.length <= n ? str : str.slice(0, n - 1) + '…';
}
