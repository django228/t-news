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
    isSearching = false;
    _initialized = false;
    _hashChangeHandler = null;

    constructor() {
        super(SearchPageStyles, (args) => searchPageTemplate(args, this.results || [], this.searchType || 'users', this.query || ''));
        this.apiService = inject(SERVICES.ApiService);
        this.results = [];
    }

    onReady() {
        this.setupResultListeners();

        if (!this._initialized) {
            this._initialized = true;
            this._readFromUrl();
            this.performSearch();

            this._hashChangeHandler = () => {
                const prevQuery = this.query;
                const prevType = this.searchType;
                this._readFromUrl();
                if (this.query !== prevQuery || this.searchType !== prevType) {
                    this.isSearching = false;
                    this.performSearch();
                }
            };
            window.addEventListener('hashchange', this._hashChangeHandler);
        }
    }

    onDisconnect() {
        if (this._hashChangeHandler) {
            window.removeEventListener('hashchange', this._hashChangeHandler);
            this._hashChangeHandler = null;
        }
        this._initialized = false;
    }

    _readFromUrl() {
        const hash = window.location.hash; // e.g. #/search?q=Платон&type=users
        const qmark = hash.indexOf('?');
        const params = new URLSearchParams(qmark >= 0 ? hash.slice(qmark + 1) : '');
        this.query = params.get('q') || '';
        this.searchType = params.get('type') || 'users';
    }

    setupResultListeners() {
        const container = this.shadowRoot.querySelector(`.${SearchPage.rootClass}`);
        if (!container) return;

        container.addEventListener('click', (e) => {
            const userCard = e.target.closest('.search-user-card');
            if (userCard) {
                const userId = userCard.getAttribute('data-user-id');
                if (userId) window.location.hash = `/profile/${userId}`;
                return;
            }
            const byAvatar = e.target.closest('.post-avatar');
            const byAuthor = e.target.closest('.post-author');
            if (byAvatar || byAuthor) {
                const userId = (byAvatar || byAuthor).getAttribute('data-user-id');
                if (userId) window.location.hash = `/profile/${userId}`;
            }
        });
    }

    render() {
        super.render(
            {rootClass: SearchPage.rootClass},
            this.results || [],
            this.searchType || 'users',
            this.query || ''
        );
    }

    async performSearch() {
        if (this.isSearching) return;
        if (!this.query) {
            this.results = [];
            this.render();
            return;
        }
        this.isSearching = true;
        try {
            this.results = await this.apiService.get(
                `search?query=${encodeURIComponent(this.query)}&type=${this.searchType}`
            );
        } catch {
            this.results = [];
        } finally {
            this.isSearching = false;
        }
        this.render();
    }
}
