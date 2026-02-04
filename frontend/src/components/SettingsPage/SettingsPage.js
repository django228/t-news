import {SandyElement} from '@/index';
import SettingsPageStyles from './SettingsPage.scss?inline';
import {settingsPageTemplate} from './SettingsPageTemplate';
import {SERVICES} from '@/services/utils';
import {inject} from '@/di/di';

export class SettingsPage extends SandyElement {
    static rootClass = 'settings-page';
    apiService;
    authService;

    constructor() {
        super(SettingsPageStyles, (args = {}) => settingsPageTemplate(args, this.user || {}));
        this.apiService = inject(SERVICES.ApiService);
        this.authService = inject(SERVICES.AuthService);
        this.user = {};
    }

    async onReady() {
        await this.loadUser();
        this.setupEventListeners();
    }

    async loadUser() {
        try {
            this.user = await this.apiService.get('auth/me');
            this.render();
        } catch (error) {
            this.user = { username: '', bio: '', avatar: '' };
            this.render();
        }
    }

    setupEventListeners() {
        const form = this.shadowRoot.querySelector('.settings-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updates = {
            username: formData.get('username'),
            bio: formData.get('bio'),
            avatar: formData.get('avatar'),
        };

        try {
            const user = await this.apiService.get('auth/me');
            await this.apiService.patch(`users/${user.id}`, updates);
            await this.loadUser();
            alert('Настройки сохранены');
        } catch (error) {
            alert('Ошибка');
        }
    }
}

