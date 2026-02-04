import {SandyElement} from '@/index';
import LoginPageStyles from './LoginPage.scss?inline';
import {loginPageTemplate} from './LoginPageTemplate';
import {SERVICES} from '@/services/utils';
import {inject} from '@/di/di';

export class LoginPage extends SandyElement {
    static rootClass = 'login-page';
    authService;

    constructor() {
        super(LoginPageStyles, loginPageTemplate);
        this.authService = inject(SERVICES.AuthService);
    }

    onReady() {
        const submitBtn = this.shadowRoot.querySelector('.login-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', this.handleSubmit.bind(this));
        }

        const signupLink = this.shadowRoot.querySelector('a[href="/signup"]');
        if (signupLink) {
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = '/signup';
            });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = this.shadowRoot.querySelector('.login-form');
        if (!form) return;
        
        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            await this.authService.login(username, password);
            this.showNotification('Успешный вход!');
            setTimeout(() => {
                window.location.hash = '/';
                window.location.reload();
            }, 1000);
        } catch (error) {
            alert('Ошибка входа');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000;';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}
