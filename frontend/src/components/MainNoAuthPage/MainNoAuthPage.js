import {SandyElement} from '@/index';
import MainNoAuthPageStyles from './MainNoAuthPage.scss?inline';
import {mainNoAuthPageTemplate} from './MainNoAuthPageTemplate';
import {SERVICES} from '@/services/utils';
import {inject} from '@/di/di';

export class MainNoAuthPage extends SandyElement {
    static rootClass = 'main-no-auth-page';
    apiService;
    isLoading = false;

    constructor() {
        super(MainNoAuthPageStyles, mainNoAuthPageTemplate.bind(null, {rootClass: MainNoAuthPage.rootClass}));
        this.apiService = inject(SERVICES.ApiService);
        this.posts = [];
    }

    async onReady() {
        await this.loadAllPosts();
        window.addEventListener('post-created', () => this.loadAllPosts());
    }
    
    render(...args) {
        super.render(...args);
        setTimeout(() => this.updatePosts(), 100);
    }

    async loadAllPosts() {
        if (this.isLoading) return;
        this.isLoading = true;
        try {
            const allPosts = await this.apiService.get('posts');
            this.posts = allPosts.map(post => ({
                ...post,
                user: post.user || { username: 'User', id: post.userId, avatar: '/Master.svg' },
                likes: post.likes || [],
                comments: post.comments || []
            }));
            this.updatePosts();
        } catch (error) {
            this.posts = [];
            this.updatePosts();
        }
        this.isLoading = false;
    }

    updatePosts() {
        const container = this.shadowRoot.querySelector(`.${MainNoAuthPage.rootClass}`);
        if (!container) {
            setTimeout(() => this.updatePosts(), 50);
            return;
        }
        
        if (this.posts.length > 0) {
            container.innerHTML = this.posts.map(post => this.renderPost(post)).join('');
            this.setupEventListeners();
        } else {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">Нет постов</p>';
        }
    }

    setupEventListeners() {
        const container = this.shadowRoot.querySelector(`.${MainNoAuthPage.rootClass}`);
        if (!container || this.eventHandler) return;

        this.eventHandler = (e) => {
            const avatar = e.target.closest('.post-avatar');
            const author = e.target.closest('.post-author');
            if (avatar || author) {
                const userId = (avatar || author).getAttribute('data-user-id');
                if (userId) window.location.hash = `/profile/${userId}`;
                return;
            }
            
            const button = e.target.closest('button');
            if (!button) return;
            
            const postId = button.getAttribute('data-post-id');
            if (!postId) return;

            if (button.classList.contains('like-btn') || button.classList.contains('comments-btn')) {
                window.location.hash = '/login';
            }
        };
        
        container.addEventListener('click', this.eventHandler);
    }

    renderPost(post) {
        const likesCount = post.likes?.length || 0;
        const commentsCount = post.comments?.length || 0;
        const user = post.user || {};
        const avatarUrl = user.avatar || '/Master.svg';
        const username = user.username || 'User';
        const userId = user.id || post.userId;
        
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
                            <path d="M20.84 4.60999C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.49999C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.60999Z" stroke="#1E1E1E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${likesCount}
                    </button>
                    <button class="comments-btn" data-post-id="${post.id}">Комментарии ${commentsCount}</button>
                </div>
            </div>
        `;
    }
}
