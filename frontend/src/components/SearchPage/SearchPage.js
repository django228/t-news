import {SandyElement} from '@/index';
import SearchPageStyles from './SearchPage.scss?inline';
import {searchPageTemplate} from './SearchPageTemplate';
import {SERVICES} from '@/services/utils';
import {inject} from '@/di/di';

export class SearchPage extends SandyElement {
    static rootClass = 'search-page';
    apiService;
    searchType = 'users';
    query = '';
    results = [];

    constructor() {
        super(SearchPageStyles, (args) => searchPageTemplate(args, this.results, this.searchType, this.query));
        this.apiService = inject(SERVICES.ApiService);
    }

    render() {
        super.render({rootClass: SearchPage.rootClass});
        this.attachTypeToggle();
        this.setupResultListeners();
    }

    onReady() {
        this.query = this.getQueryFromUrl();

        this.hashChangeHandler = () => {
            if (!window.location.hash.startsWith('#/search')) return;
            const newQuery = this.getQueryFromUrl();
            if (newQuery !== this.query) {
                this.query = newQuery;
                this.performSearch();
            }
        };
        window.addEventListener('hashchange', this.hashChangeHandler);

        if (this.query) {
            this.performSearch();
        }
    }

    onDisconnect() {
        if (this.hashChangeHandler) {
            window.removeEventListener('hashchange', this.hashChangeHandler);
        }
    }

    getQueryFromUrl() {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.split('?')[1] || '');
        return params.get('q') || '';
    }

    attachTypeToggle() {
        const typeToggle = this.shadowRoot.querySelector('.type-toggle');
        if (!typeToggle) return;
        typeToggle.addEventListener('change', (e) => {
            this.searchType = e.target.value;
            if (this.query) {
                this.performSearch();
            }
        });
    }

    setupResultListeners() {
        const container = this.shadowRoot.querySelector(`.${SearchPage.rootClass}`);
        if (!container) return;

        container.addEventListener('click', (e) => {
            const userCard = e.target.closest('.search-user-card');
            const avatar = e.target.closest('.post-avatar');
            const author = e.target.closest('.post-author');

            const userId = userCard?.getAttribute('data-user-id')
                || avatar?.getAttribute('data-user-id')
                || author?.getAttribute('data-user-id');

            if (userId) {
                window.location.hash = `/profile/${userId}`;
            }
        });
    }

    async performSearch() {
        if (!this.query) {
            this.results = [];
            this.render();
            return;
        }

        try {
            this.results = await this.apiService.get(`search?query=${encodeURIComponent(this.query)}&type=${this.searchType}`);
        } catch {
            this.results = [];
        }
        this.render();
    }
}
