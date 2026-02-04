import {SandyElement} from './index';
import {AppTemplate} from './AppTemplate';
import AppStyles from './index.scss?inline';
import {SERVICES} from './services/utils';
import {inject} from '@/di/di';
import {RouterService} from './services/RouterService';
import {FeedPage} from './components/FeedPage/FeedPage';
import {LoginPage} from './components/LoginPage/LoginPage';
import {ProfilePage} from './components/ProfilePage/ProfilePage';
import {SearchPage} from './components/SearchPage/SearchPage';
import {SettingsPage} from './components/SettingsPage/SettingsPage';

export class App extends SandyElement {
    authService;
    router;
    apiService;
    currentRoute = '/';

    constructor() {
        super(AppStyles, AppTemplate);
        this.authService = inject(SERVICES.AuthService);
        this.apiService = inject(SERVICES.ApiService);
        this.router = RouterService();
        this.router.subscribe(this.handleRouteChange.bind(this));
    }
    
    connectedCallback() {
        super.connectedCallback();
        const initialRoute = this.router.getCurrentRoute() || '/';
        this.handleRouteChange(initialRoute);
        
        this.avatarUpdateHandler = () => {
            this.updateNavigation();
        };
        window.addEventListener('avatar-updated', this.avatarUpdateHandler);
    }
    
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.avatarUpdateHandler) {
            window.removeEventListener('avatar-updated', this.avatarUpdateHandler);
        }
    }

    handleRouteChange(route) {
        const isAuthPage = route === '/login' || route === '/signup';
        const isAuthRequired = route !== '/login' && route !== '/signup' && route !== '' && route !== '/';
        
        if (isAuthRequired && !this.authService.isAuthenticated()) {
            if (isAuthPage) {
                this.currentRoute = route;
            } else {
                this.currentRoute = '/';
            }
        } else if (isAuthPage && this.authService.isAuthenticated()) {
            this.router.navigate('/');
            return;
        } else {
            this.currentRoute = route || '/';
        }
        
        this.render();
        this.loadPage();
        this.updateNavigation();
        
        setTimeout(() => {
            this.setupSearch();
        }, 0);
        
    }

    async loadPage() {
        const content = this.shadowRoot.querySelector('#page-content');
        if (!content) {
            setTimeout(() => this.loadPage(), 100);
            return;
        }

        content.innerHTML = '';

        let componentName = null;
        let userId = null;
        
        if (this.currentRoute.startsWith('/profile/')) {
            componentName = 'profile-page-component';
            userId = this.currentRoute.replace('/profile/', '').split('?')[0];
        } else if (this.currentRoute.startsWith('/search')) {
            componentName = 'search-page-component';
        } else {
            switch (this.currentRoute.split('?')[0]) {
                case '/':
                case '':
                    if (this.authService.isAuthenticated()) {
                        componentName = 'feed-page-component';
                    } else {
                        await this.renderMainNoAuth(content);
                        return;
                    }
                    break;
                case '/login':
                    componentName = 'login-page-component';
                    break;
                case '/signup':
                    componentName = 'signup-page-component';
                    break;
                case '/profile':
                    componentName = 'profile-page-component';
                    break;
                case '/settings':
                    componentName = 'settings-page-component';
                    break;
                default:
                    content.innerHTML = '<p>Страница не найдена</p>';
                    return;
            }
        }

        if (componentName) {
            const element = document.createElement(componentName);
            if (userId) {
                element.setAttribute('user-id', userId);
            }
            content.appendChild(element);
        }
    }

    async renderMainNoAuth(container) {
        try {
            const allPosts = await this.apiService.get('posts');
            const posts = allPosts.map(post => ({
                ...post,
                user: post.user || { username: 'User', id: post.userId, avatar: '/Master.svg' },
                likes: post.likes || [],
                comments: post.comments || []
            }));

            const postsHtml = posts.map(post => {
                const likesCount = post.likes?.length || 0;
                const commentsCount = post.comments?.length || 0;
                let avatarUrl = post.user?.avatar || '/Master.svg';
                if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/') && avatarUrl !== '/Master.svg') {
                    avatarUrl = `http://localhost:3000${avatarUrl}`;
                } else if (avatarUrl && avatarUrl.startsWith('/uploads')) {
                    avatarUrl = `http://localhost:3000${avatarUrl}`;
                }
                const username = post.user?.username || 'User';
                const userId = post.user?.id || post.userId;
                return `
                    <div class="post-card" data-post-id="${post.id}">
                        <div class="post-header">
                            <img src="${avatarUrl}" class="post-avatar" alt="Avatar" onerror="this.src='/Master.svg'" data-user-id="${userId}" style="cursor: pointer;">
                            <div class="post-author" data-user-id="${userId}" style="cursor: pointer;">${username}</div>
                        </div>
                        <div class="post-content">${post.content}</div>
                        <div class="post-footer">
                            <button class="like-btn" data-post-id="${post.id}">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.84 4.60999C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.49999C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.60999Z" stroke="#1E1E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                ${likesCount}
                            </button>
                            <button class="comments-btn" data-post-id="${post.id}">Комментарии ${commentsCount}</button>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = `
                <div class="main-no-auth-page">
                    ${postsHtml}
                </div>
            `;

            container.addEventListener('click', (e) => {
                const avatar = e.target.closest('.post-avatar');
                const author = e.target.closest('.post-author');
                
                if (avatar || author) {
                    const userId = (avatar || author).getAttribute('data-user-id');
                    if (userId) {
                        window.location.hash = `/profile/${userId}`;
                        return;
                    }
                }
                
                const button = e.target.closest('button');
                if (!button) return;
                
                const postId = button.getAttribute('data-post-id');
                if (!postId) return;

                if (button.classList.contains('like-btn') || button.classList.contains('comments-btn')) {
                    window.location.hash = '/login';
                }
            });

        } catch (error) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">Ошибка загрузки постов</p>';
        }
    }

    async renderSearch(container, query) {
        try {
            const searchType = 'users';
            const results = await this.apiService.get(`search?query=${encodeURIComponent(query)}&type=${searchType}`);
            
            const resultsHtml = results.length > 0
                ? results.map(result => {
                    if (result.username) {
                        let avatarUrl = result.avatar || '/Master.svg';
                        if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/') && avatarUrl !== '/Master.svg') {
                            avatarUrl = `http://localhost:3000${avatarUrl}`;
                        } else if (avatarUrl && avatarUrl.startsWith('/uploads')) {
                            avatarUrl = `http://localhost:3000${avatarUrl}`;
                        }
                        return `
                            <div class="search-user-card" data-user-id="${result.id}" style="cursor: pointer;">
                                <img src="${avatarUrl}" class="user-avatar" alt="Avatar" onerror="this.src='/Master.svg'">
                                <div class="user-info">
                                    <div class="user-name">${result.username}</div>
                                    ${result.bio ? `<div class="user-bio">${result.bio}</div>` : ''}
                                </div>
                            </div>
                        `;
                    } else {
                        let avatarUrl = result.user?.avatar || '/Master.svg';
                        if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/') && avatarUrl !== '/Master.svg') {
                            avatarUrl = `http://localhost:3000${avatarUrl}`;
                        } else if (avatarUrl && avatarUrl.startsWith('/uploads')) {
                            avatarUrl = `http://localhost:3000${avatarUrl}`;
                        }
                        return `
                            <div class="search-post-card" data-post-id="${result.id}">
                                <div class="post-header">
                                    <img src="${avatarUrl}" class="post-avatar" alt="Avatar" onerror="this.src='/Master.svg'" data-user-id="${result.userId}" style="cursor: pointer;">
                                    <div class="post-author" data-user-id="${result.userId}" style="cursor: pointer;">${result.user?.username || 'User'}</div>
                                </div>
                                <div class="post-content">${result.content || ''}</div>
                            </div>
                        `;
                    }
                }).join('')
                : '<p style="text-align: center; padding: 40px;">Ничего не найдено</p>';
            
            container.innerHTML = `
                <div class="search-results-page">
                    <div class="search-header">
                        <input type="text" class="search-input" value="${query}" placeholder="Поиск по T-News">
                        <select class="type-toggle">
                            <option value="users" selected>Пользователи</option>
                            <option value="posts">Посты</option>
                        </select>
                    </div>
                    <div class="search-results">
                        ${resultsHtml}
                    </div>
                </div>
            `;
            
            const searchInput = container.querySelector('.search-input');
            const typeToggle = container.querySelector('.type-toggle');
            
            if (searchInput) {
                searchInput.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter') {
                        const newQuery = e.target.value.trim();
                        if (newQuery) {
                            await this.renderSearch(container, newQuery);
                        }
                    }
                });
            }
            
            if (typeToggle) {
                typeToggle.addEventListener('change', async (e) => {
                    const query = searchInput?.value.trim() || query;
                    if (query) {
                        const results = await this.apiService.get(`search?query=${encodeURIComponent(query)}&type=${e.target.value}`);
                        await this.renderSearch(container, query);
                    }
                });
            }
            
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
        } catch (error) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">Ошибка поиска</p>';
        }
    }

    
    setupSearch() {
        const searchInput = this.shadowRoot.querySelector('.search-input');
        if (!searchInput) return;
        
        if (searchInput.hasAttribute('data-listener')) {
            return;
        }
        
        searchInput.setAttribute('data-listener', 'true');
        searchInput.style.cursor = 'text';
        
        searchInput.addEventListener('click', () => {
            if (this.currentRoute !== '/search' && !this.currentRoute.startsWith('/search?')) {
                this.router.navigate('/search');
            }
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query) {
                    this.router.navigate(`/search?q=${encodeURIComponent(query)}`);
                } else {
                    this.router.navigate('/search');
                }
            }
        });
    }

    setupNavigationListeners() {
        const logo = this.shadowRoot.querySelector('.logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.onclick = () => {
                this.router.navigate('/');
            };
        }
        
        const navRight = this.shadowRoot.querySelector('#nav-right');
        if (navRight) {
            navRight.onclick = (e) => {
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    e.preventDefault();
                    const link = e.target.closest('a') || e.target;
                    const href = link.getAttribute('href');
                    if (href) {
                        if (href === '/logout') {
                            this.authService.logout();
                            this.router.navigate('/login');
                            this.updateNavigation();
                        } else {
                            this.router.navigate(href);
                        }
                    }
                } else if (e.target.classList.contains('profile-avatar') || e.target.closest('.profile-avatar')) {
                    this.router.navigate('/profile');
                }
            };
        }
    }

    async updateNavigation() {
        const nav = this.shadowRoot.querySelector('.tui-navigation');
        if (!nav) return;

        const isAuthPage = this.currentRoute === '/login' || this.currentRoute === '/signup';
        if (isAuthPage) {
            nav.style.display = 'none';
            return;
        }
        
        nav.style.display = 'flex';
        const navRight = this.shadowRoot.querySelector('#nav-right');
        if (!navRight) return;

        if (this.authService.isAuthenticated()) {
            let avatarUrl = '/Master.svg';
            try {
                const currentUser = await this.apiService.get('auth/me');
                if (currentUser.avatar) {
                    if (currentUser.avatar.startsWith('http')) {
                        avatarUrl = currentUser.avatar;
                    } else if (currentUser.avatar.startsWith('/uploads')) {
                        avatarUrl = `http://localhost:3000${currentUser.avatar}`;
                    } else if (currentUser.avatar.startsWith('/')) {
                        avatarUrl = currentUser.avatar;
                    } else {
                        avatarUrl = `http://localhost:3000${currentUser.avatar}`;
                    }
                    if (avatarUrl !== '/Master.svg') {
                        const separator = avatarUrl.includes('?') ? '&' : '?';
                        avatarUrl = `${avatarUrl}${separator}t=${Date.now()}`;
                    }
                }
            } catch (error) {
            }
            
            navRight.innerHTML = `
                <a href="/logout" class="nav-link">
                    <span>Выйти</span>
                    <img src="/arrow-in-right.svg" alt=">" width="24" height="24">
                </a>
                <img src="${avatarUrl}" class="profile-avatar" alt="Profile" style="cursor: pointer;" onerror="this.src='/Master.svg'">
            `;
        } else {
            navRight.innerHTML = `
                <a href="/signup" class="nav-link">
                    <span>Зарегестрироваться</span>
                    <img src="/arrow-in-right.svg" alt=">" width="24" height="24">
                </a>
                <a href="/login" class="nav-link">
                    <span>Войти</span>
                    <img src="/arrow-in-right.svg" alt=">" width="24" height="24">
                </a>
            `;
        }
        
        this.setupNavigationListeners();
        this.setupSearch();
    }
}
