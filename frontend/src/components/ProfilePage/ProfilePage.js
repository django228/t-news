import {SandyElement} from '@/index';
import ProfilePageStyles from './ProfilePage.scss?inline';
import {profilePageTemplate} from './ProfilePageTemplate';
import {SERVICES} from '@/services/utils';
import {inject} from '@/di/di';
import {apiUrl} from '@/baseUrl';

export class ProfilePage extends SandyElement {
    static rootClass = 'profile-page';
    apiService;
    authService;
    userId;
    currentUserId;
    isOwnProfile = false;
    isFollowing = false;
    isLoading = false;

    constructor() {
        super(ProfilePageStyles, profilePageTemplate);
        this.apiService = inject(SERVICES.ApiService);
        this.authService = inject(SERVICES.AuthService);
        this.user = {};
        this.posts = [];
    }

    render() {
        super.render(
            {rootClass: ProfilePage.rootClass},
            this.user || {},
            this.posts || [],
            this.isOwnProfile,
            this.isFollowing
        );
        setTimeout(() => this.setupEventListeners(), 0);
    }

    async onReady() {
        if (this.isLoading) return;
        this.isLoading = true;
        try {
            await this.loadCurrentUser();

            const userId = this.getAttribute('user-id');
            this.userId = userId || this.currentUserId;
            this.isOwnProfile = this.userId === this.currentUserId;

            await Promise.all([this.loadProfile(), this.loadPosts()]);

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
        } catch {
        }
    }

    async loadProfile() {
        try {
            this.user = this.userId
                ? await this.apiService.get(`users/${this.userId}`)
                : { username: 'Loading...', bio: '' };
        } catch {
            this.user = { username: 'Error', bio: '' };
        }
    }

    async loadPosts() {
        try {
            this.posts = this.userId
                ? await this.apiService.get(`users/${this.userId}/posts`)
                : [];
        } catch {
            this.posts = [];
        }
    }

    async checkFollowing() {
        try {
            if (this.currentUserId && this.userId) {
                const following = await this.apiService.get(`users/${this.currentUserId}/following`);
                this.isFollowing = following.some(u => u.id === this.userId);
            }
        } catch {
        }
    }

    setupEventListeners() {
        const container = this.shadowRoot.querySelector(`.${ProfilePage.rootClass}`);
        if (!container) return;

        container.addEventListener('click', async (e) => {
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
        });

        const avatarInput = this.shadowRoot.querySelector('.avatar-input');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                if (e.target.files?.[0]) {
                    this.uploadAvatar(e.target.files[0]);
                }
            });
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
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
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const token = this.apiService.getToken();
            const response = await fetch(`${apiUrl}/users/${this.userId}/avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(await response.text() || 'Upload failed');
            }

            const updatedUser = await response.json();
            this.user = updatedUser;
            this.render();
            this.showNotification('Аватарка успешно обновлена');
            window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { userId: this.userId, avatar: updatedUser.avatar } }));
        } catch {
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
            window.dispatchEvent(new CustomEvent('post-created'));
        } catch {
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
        } catch {
            this.showNotification('Ошибка при подписке', 'error');
        }
    }

    async saveProfile() {
        const username = this.shadowRoot.querySelector('.profile-username-input')?.value?.trim();
        const bio = this.shadowRoot.querySelector('.profile-bio-input')?.value?.trim();

        try {
            await this.apiService.patch(`users/${this.userId}`, { username, bio });
            await this.loadProfile();
            this.render();
            this.showNotification('Профиль успешно сохранён');
        } catch {
            this.showNotification('Ошибка при сохранении', 'error');
        }
    }

    async deletePost(postId) {
        if (!confirm('Удалить этот пост?')) return;

        try {
            await this.apiService.delete(`posts/${postId}`);
            await this.loadPosts();
            this.render();
        } catch {
            this.showNotification('Ошибка при удалении поста', 'error');
        }
    }
}
