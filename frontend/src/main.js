import {registry} from './registry/regestry';
import {App} from './App';
import {SERVICES} from './services/utils';
import {ApiService} from './services/ApiService';
import {AuthService} from './services/AuthService';
import {FeedPage} from './components/FeedPage/FeedPage';
import {MainNoAuthPage} from './components/MainNoAuthPage/MainNoAuthPage';
import {LoginPage} from './components/LoginPage/LoginPage';
import {SignupPage} from './components/SignupPage/SignupPage';
import {ProfilePage} from './components/ProfilePage/ProfilePage';
import {SearchPage} from './components/SearchPage/SearchPage';
import {SettingsPage} from './components/SettingsPage/SettingsPage';

registry()
    .resetCss()
    .register(App, FeedPage, MainNoAuthPage, LoginPage, SignupPage, ProfilePage, SearchPage, SettingsPage)
    .provideService(
        [SERVICES.ApiService, ApiService],
        [SERVICES.AuthService, AuthService],
    )
    .init()
    .mount('#app', App);
