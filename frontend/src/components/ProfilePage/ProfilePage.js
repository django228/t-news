import {SandyElement} from '@/index';
import ProfilePageStyles from './ProfilePage.scss?inline';
import {profilePageTemplate} from './ProfilePageTemplate';
import {SERVICES} from '@/services/utils';
import {inject} from '@/di/di';

export class ProfilePage extends SandyElement {
    static rootClass = 'profile-page';
    apiService;
    authService;
    userId;
    currentUserId;
    isOwnProfile = false;
    isFollowing = false;
    isLoading = false;
    listenersSetup = false;
    isInitialized = false;

    constructor() {
        super(ProfilePageStyles, profilePageTemplate);
        this.apiService = inject(SERVICES.ApiService);
        this.authService = inject(SERVICES.AuthService);
        this.user = {};
        this.posts = [];
    }
    
    render(...args) {
        super.render(
            {rootClass: ProfilePage.rootClass},
            this.user || {},
            this.posts || [],
            this.isOwnProfile,
            this.isFollowing
        );
        
        if (!this.isInitialized) {
            this.isInitialized = true;
            setTimeout(() => this.onReady(), 0);
        } else {
            setTimeout(() => {
                if (!this.listenersSetup) {
                    this.setupEventListeners();
                    this.listenersSetup = true;
                }
            }, 0);
        }
    }

    async onReady() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        try {
            await this.loadCurrentUser();
            
            const userId = this.getAttribute('user-id');
            if (userId) {
                this.userId = userId;
            } else {
                this.userId = this.currentUserId;
            }
            
            this.isOwnProfile = this.userId === this.currentUserId;
            
            await Promise.all([
                this.loadProfile(),
                this.loadPosts(),
            ]);
            
            if (!this.isOwnProfile && this.currentUserId) {
                await this.checkFollowing();
            }
            
            this.render();
        } finally {
            this.isLoading = false;
        }
    }

    async loadCurrentUser() {
        if (this.currentUserId) return;
        
        try {
            const currentUser = await this.apiService.get('auth/me');
            this.currentUserId = currentUser.id;
        } catch (error) {
        }
    }

    async loadProfile() {
        try {
            if (this.userId) {
                this.user = await this.apiService.get(`users/${this.userId}`);
            } else {
                this.user = { username: 'Loading...', bio: '' };
            }
        } catch (error) {
            this.user = { username: 'Error', bio: '' };
        }
    }

    async loadPosts() {
        try {
            if (this.userId) {
                this.posts = await this.apiService.get(`users/${this.userId}/posts`);
            } else {
                this.posts = [];
            }
        } catch (error) {
            this.posts = [];
        }
    }

    async checkFollowing() {
        try {
            if (this.currentUserId && this.userId) {
                const following = await this.apiService.get(`users/${this.currentUserId}/following`);
                this.isFollowing = following.some(u => u.id === this.userId);
            }
        } catch (error) {
        }
    }

    setupEventListeners() {
        const container = this.shadowRoot.querySelector(`.${ProfilePage.rootClass}`);
        if (!container || this.eventHandler) return;

        this.eventHandler = async (e) => {
            if (e.target.closest('.create-post-btn')) {
                await this.createPost();
            } else if (e.target.closest('.follow-btn')) {
                await this.toggleFollow();
            } else if (e.target.closest('.save-profile-btn')) {
                await this.saveProfile();
            } else if (e.target.closest('.delete-post-btn')) {
                const postId = e.target.closest('.delete-post-btn').getAttribute('data-post-id');
                await this.deletePost(postId);
            }
        };
        
        container.addEventListener('click', this.eventHandler);
        
        const avatarInput = this.shadowRoot.querySelector('.avatar-input');
        if (avatarInput && !avatarInput.hasAttribute('data-listener')) {
            avatarInput.setAttribute('data-listener', 'true');
            avatarInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.uploadAvatar(e.target.files[0]);
                }
            });
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        const bgColor = type === 'success' ? '#4CAF50' : '#f44336';
        notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async uploadAvatar(file) {
        if (!file) return;
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        try {
            const token = this.apiService.getToken();
            const response = await fetch(`http://localhost:3000/api/users/${this.userId}/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to upload avatar');
            }
            
            const updatedUser = await response.json();
            this.user = updatedUser;
            await this.loadProfile();
            this.render();
            this.showNotification('Аватарка успешно обновлена');
            
            const event = new CustomEvent('avatar-updated', { detail: { userId: this.userId, avatar: updatedUser.avatar } });
            window.dispatchEvent(event);
        } catch (error) {
            this.showNotification('Ошибка при загрузке аватарки', 'error');
        }
    }

    async createPost() {
        const input = this.shadowRoot.querySelector('.post-input');
        const content = input?.value?.trim();
        if (!content) return;

        try {
            await this.apiService.post(`users/${this.userId}/posts`, { content });
            input.value = '';
            await this.loadPosts();
            this.render();
            this.showNotification('Пост успешно опубликован');
            
            const event = new CustomEvent('post-created');
            window.dispatchEvent(event);
        } catch (error) {
            this.showNotification('Ошибка при создании поста', 'error');
        }
    }

    async toggleFollow() {
        try {
            if (this.isFollowing) {
                await this.apiService.delete(`users/${this.userId}/follow`);
                this.isFollowing = false;
            } else {
                await this.apiService.post(`users/${this.userId}/follow`, {});
                this.isFollowing = true;
            }
            this.render();
        } catch (error) {
            alert('Ошибка');
        }
    }

    async saveProfile() {
        const username = this.shadowRoot.querySelector('.profile-username-input')?.value?.trim();
        const bio = this.shadowRoot.querySelector('.profile-bio-input')?.value?.trim();

        try {
            await this.apiService.patch(`users/${this.userId}`, { username, bio });
            await this.loadProfile();
            this.render();
            this.showNotification('Профиль успешно сохранен');
        } catch (error) {
            this.showNotification('Ошибка при сохранении', 'error');
        }
    }

    async deletePost(postId) {
        if (!confirm('Удалить этот пост?')) return;

        try {
            await this.apiService.delete(`posts/${postId}`);
            await this.loadPosts();
            this.render();
        } catch (error) {
            alert('Ошибка при удалении');
        }
    }
}
