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

    constructor() {
        super(SearchPageStyles, (args) => searchPageTemplate(args, this.results || [], this.searchType || 'users', this.query || ''));
        this.apiService = inject(SERVICES.ApiService);
        this.results = [];
    }

    onReady() {
        this.loadQueryFromUrl();
        
        const searchInput = this.shadowRoot.querySelector('.search-input');
        const typeToggle = this.shadowRoot.querySelector('.type-toggle');
        
        if (searchInput) {
            if (this.query) {
                searchInput.value = this.query;
                this.performSearch();
            }
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.query = e.target.value.trim();
                    if (this.query) {
                        window.location.hash = `/search?q=${encodeURIComponent(this.query)}`;
                        this.performSearch();
                    } else {
                        this.results = [];
                        this.render();
                    }
                }
            });
        }

        if (typeToggle) {
            typeToggle.addEventListener('change', (e) => {
                this.searchType = e.target.value;
                if (this.query) {
                    this.performSearch();
                }
            });
        }
        
        this.setupResultListeners();
        
        if (window.location.hash.startsWith('#/search')) {
            const hash = window.location.hash;
            const searchParams = new URLSearchParams(hash.split('?')[1] || '');
            const urlQuery = searchParams.get('q') || '';
            if (urlQuery && urlQuery !== this.query) {
                this.query = urlQuery;
                if (searchInput) {
                    searchInput.value = this.query;
                }
                this.performSearch();
            }
        }
    }
    
    loadQueryFromUrl() {
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(hash.split('?')[1] || '');
        const urlQuery = searchParams.get('q') || '';
        this.query = urlQuery;
    }
    
    setupResultListeners() {
        const container = this.shadowRoot.querySelector(`.${SearchPage.rootClass}`);
        if (!container) return;
        
        container.addEventListener('click', (e) => {
            const userCard = e.target.closest('.search-user-card');
            const avatar = e.target.closest('.post-avatar');
            const author = e.target.closest('.post-author');
            
            if (userCard) {
                const userId = userCard.getAttribute('data-user-id');
                if (userId) {
                    window.location.hash = `/profile/${userId}`;
                }
            } else if (avatar || author) {
                const userId = (avatar || author).getAttribute('data-user-id');
                if (userId) {
                    window.location.hash = `/profile/${userId}`;
                }
            }
        });
    }

    render(...args) {
        const wasFocused = document.activeElement === this.shadowRoot?.querySelector('.search-input');
        super.render(
            {rootClass: SearchPage.rootClass},
            this.results || [],
            this.searchType || 'users',
            this.query || ''
        );
        if (wasFocused) {
            setTimeout(() => {
                const searchInput = this.shadowRoot.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                    const cursorPos = searchInput.value.length;
                    searchInput.setSelectionRange(cursorPos, cursorPos);
                }
            }, 0);
        }
    }

    async performSearch() {
        if (!this.query) {
            this.results = [];
            this.render();
            return;
        }

        try {
            this.results = await this.apiService.get(`search?query=${encodeURIComponent(this.query)}&type=${this.searchType}`);
            this.render();
        } catch (error) {
            this.results = [];
            this.render();
        }
    }
}

