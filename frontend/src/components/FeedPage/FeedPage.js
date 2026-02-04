import {SandyElement} from '@/index';
import FeedPageStyles from './FeedPage.scss?inline';
import {feedPageTemplate} from './FeedPageTemplate';
import {SERVICES} from '@/services/utils';
import {inject} from '@/di/di';

export class FeedPage extends SandyElement {
    static rootClass = 'feed-page';
    apiService;
    authService;
    isLoading = false;

    constructor() {
        super(FeedPageStyles, feedPageTemplate.bind(null, {rootClass: FeedPage.rootClass}));
        this.apiService = inject(SERVICES.ApiService);
        this.authService = inject(SERVICES.AuthService);
        this.posts = [];
        this.openComments = {};
        this.commentsData = {};
    }

    async onReady() {
        await this.loadFeed();
        
        window.addEventListener('post-created', () => {
            this.isLoading = false;
            this.loadFeed();
        });
    }
    
    render(...args) {
        super.render(...args);
        setTimeout(() => {
            if (this.posts && this.posts.length > 0) {
                this.updatePosts();
            }
        }, 100);
    }

    async loadFeed() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        try {
            const posts = await this.apiService.get('feed');
            this.posts = posts.map(post => ({
                ...post,
                user: post.user || { username: 'User', id: post.userId, avatar: '/Master.svg' },
                likes: post.likes || [],
                comments: post.comments || []
            }));
            setTimeout(() => this.updatePosts(), 100);
        } catch (error) {
            this.posts = [];
            this.updatePosts();
        } finally {
            this.isLoading = false;
        }
    }

    updatePosts() {
        const container = this.shadowRoot.querySelector(`.${FeedPage.rootClass}`);
        if (!container) {
            setTimeout(() => this.updatePosts(), 50);
            return;
        }
        
        if (this.posts && this.posts.length > 0) {
            const postsHtml = this.posts.map(post => this.renderPost(post)).join('');
            container.innerHTML = postsHtml;
        } else if (!this.isLoading) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">Нет постов</p>';
        }
        
        if (this.posts && this.posts.length > 0) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        const container = this.shadowRoot.querySelector(`.${FeedPage.rootClass}`);
        if (!container) return;
        
        if (this.eventHandler) {
            container.removeEventListener('click', this.eventHandler);
        }

        this.eventHandler = async (e) => {
            const avatar = e.target.closest('.post-avatar');
            const author = e.target.closest('.post-author');
            
            if (avatar || author) {
                const userId = (avatar || author).getAttribute('data-user-id');
                if (userId) {
                    window.location.hash = `/profile/${userId}`;
                    return;
                }
            }
            
            if (e.target.closest('.comment-avatar') || e.target.closest('.comment-author')) {
                const userId = (e.target.closest('.comment-avatar') || e.target.closest('.comment-author'))?.getAttribute('data-user-id');
                if (userId) {
                    window.location.hash = `/profile/${userId}`;
                    return;
                }
            }
            
            if (e.target.closest('.delete-comment-btn')) {
                const btn = e.target.closest('.delete-comment-btn');
                const postId = btn.getAttribute('data-post-id');
                const commentId = btn.getAttribute('data-comment-id');
                if (postId && commentId) {
                    await this.deleteComment(postId, commentId);
                }
                return;
            }
            
            if (e.target.closest('.submit-comment-btn')) {
                const btn = e.target.closest('.submit-comment-btn');
                const postId = btn.getAttribute('data-post-id');
                const input = container.querySelector(`.comment-input[data-post-id="${postId}"]`);
                if (input && input.value.trim()) {
                    await this.createComment(postId, input.value.trim());
                    input.value = '';
                }
                return;
            }
            
            const button = e.target.closest('button');
            if (!button) return;
            
            const postId = button.getAttribute('data-post-id');
            if (!postId) return;

            if (button.classList.contains('like-btn')) {
                await this.toggleLike(postId);
            } else if (button.classList.contains('comments-btn')) {
                await this.showComments(postId);
            }
        };
        
        container.addEventListener('click', this.eventHandler);
    }

    async toggleLike(postId) {
        try {
            const post = this.posts.find(p => p.id === postId);
            if (!post) return;
            
            const currentUserId = this.getCurrentUserId();
            const isLiked = post.likes?.includes(currentUserId);
            
            if (isLiked) {
                await this.apiService.delete(`posts/${postId}/likes`);
                post.likes = (post.likes || []).filter(id => id !== currentUserId);
            } else {
                await this.apiService.post(`posts/${postId}/likes`, {});
                post.likes = post.likes || [];
                post.likes.push(currentUserId);
            }
            
            this.updatePosts();
        } catch (error) {
        }
    }

    async showComments(postId) {
        try {
            if (this.openComments[postId]) {
                this.openComments[postId] = false;
            } else {
                if (!this.commentsData[postId]) {
                    const comments = await this.apiService.get(`posts/${postId}/comments`);
                    this.commentsData[postId] = comments;
                }
                this.openComments[postId] = true;
            }
            this.updatePosts();
        } catch (error) {
        }
    }

    async createComment(postId, content) {
        try {
            const comment = await this.apiService.post(`posts/${postId}/comments`, { content });
            if (!this.commentsData[postId]) {
                this.commentsData[postId] = [];
            }
            this.commentsData[postId].push(comment);
            const post = this.posts.find(p => p.id === postId);
            if (post) {
                if (!post.comments) post.comments = [];
                post.comments.push(comment.id);
            }
            this.updatePosts();
        } catch (error) {
        }
    }

    async deleteComment(postId, commentId) {
        try {
            await this.apiService.delete(`comments/${commentId}`);
            if (this.commentsData[postId]) {
                this.commentsData[postId] = this.commentsData[postId].filter(c => c.id !== commentId);
            }
            const post = this.posts.find(p => p.id === postId);
            if (post && post.comments) {
                post.comments = post.comments.filter(id => id !== commentId);
            }
            this.updatePosts();
        } catch (error) {
        }
    }

    renderPost(post) {
        const currentUserId = this.getCurrentUserId();
        const isLiked = post.likes?.includes(currentUserId);
        const likesCount = post.likes?.length || 0;
        const commentsCount = this.commentsData[post.id]?.length || post.comments?.length || 0;
        const heartFill = isLiked ? 'fill="#1E1E1E"' : '';
        let avatarUrl = post.user?.avatar || '/Master.svg';
        if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/') && avatarUrl !== '/Master.svg') {
            avatarUrl = `http://localhost:3000${avatarUrl}`;
        } else if (avatarUrl && avatarUrl.startsWith('/uploads')) {
            avatarUrl = `http://localhost:3000${avatarUrl}`;
        }
        const userId = post.user?.id || post.userId;
        const isCommentsOpen = this.openComments[post.id];
        const comments = this.commentsData[post.id] || [];
        
        let commentsHtml = '';
        if (isCommentsOpen) {
            const commentsList = comments.map(comment => {
                let commentAvatarUrl = comment.user?.avatar || '/Master.svg';
                if (commentAvatarUrl && !commentAvatarUrl.startsWith('http') && !commentAvatarUrl.startsWith('/') && commentAvatarUrl !== '/Master.svg') {
                    commentAvatarUrl = `http://localhost:3000${commentAvatarUrl}`;
                } else if (commentAvatarUrl && commentAvatarUrl.startsWith('/uploads')) {
                    commentAvatarUrl = `http://localhost:3000${commentAvatarUrl}`;
                }
                const commentUserId = comment.user?.id || comment.userId;
                const canDelete = commentUserId === currentUserId;
                return `
                    <div class="comment-item">
                        <img src="${commentAvatarUrl}" class="comment-avatar" alt="Avatar" onerror="this.src='/Master.svg'" data-user-id="${commentUserId}" style="cursor: pointer;">
                        <div class="comment-content-wrapper">
                            <div class="comment-header">
                                <span class="comment-author" data-user-id="${commentUserId}" style="cursor: pointer;">${comment.user?.username || 'User'}</span>
                                ${canDelete ? `<button class="delete-comment-btn" data-post-id="${post.id}" data-comment-id="${comment.id}">Удалить</button>` : ''}
                            </div>
                            <div class="comment-content">${comment.content}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            commentsHtml = `
                <div class="comments-section">
                    <div class="comments-list">
                        ${commentsList || '<p style="padding: 16px; text-align: center; color: rgba(0,0,0,0.54);">Нет комментариев</p>'}
                    </div>
                    <div class="comment-form">
                        <input type="text" class="comment-input" data-post-id="${post.id}" placeholder="Написать комментарий...">
                        <button class="submit-comment-btn" data-post-id="${post.id}">Отправить</button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${avatarUrl}" class="post-avatar" alt="Avatar" onerror="this.src='/Master.svg'" data-user-id="${userId}" style="cursor: pointer;">
                    <div class="post-author" data-user-id="${userId}" style="cursor: pointer;">${post.user?.username || 'User'}</div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-footer">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.84 4.60999C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.49999C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.60999Z" ${heartFill} stroke="#1E1E1E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${likesCount}
                    </button>
                    <button class="comments-btn" data-post-id="${post.id}">Комментарии ${commentsCount}</button>
                </div>
                ${commentsHtml}
            </div>
        `;
    }

    getCurrentUserId() {
        try {
            const token = this.apiService.getToken();
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub;
        } catch {
            return null;
        }
    }
}

