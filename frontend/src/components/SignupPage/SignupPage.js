import {SandyElement} from '@/index';
import SignupPageStyles from './SignupPage.scss?inline';
import {signupPageTemplate} from './SignupPageTemplate';
import {SERVICES} from '@/services/utils';
import {inject} from '@/di/di';

export class SignupPage extends SandyElement {
    static rootClass = 'signup-page';
    authService;

    constructor() {
        super(SignupPageStyles, signupPageTemplate.bind(null, {rootClass: SignupPage.rootClass}));
        this.authService = inject(SERVICES.AuthService);
    }

    onReady() {
        const submitBtn = this.shadowRoot.querySelector('.signup-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', this.handleSubmit.bind(this));
        }

        const loginLink = this.shadowRoot.querySelector('a[href="/login"]');
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = '/login';
            });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = this.shadowRoot.querySelector('.signup-form');
        if (!form) return;
        
        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        try {
            await this.authService.register(username, password);
            this.showNotification('Успешная регистрация!');
            setTimeout(() => {
                window.location.hash = '/';
                window.location.reload();
            }, 1000);
        } catch (error) {
            alert('Ошибка регистрации');
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

