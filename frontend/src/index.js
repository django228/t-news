import CommonStyles from './common.scss?inline';

export class SandyElement extends HTMLElement {

    static attributes = {};

    constructor(pathToStyles, template) {
        super();
        this.pathToStyles = pathToStyles;
        this.template = template;
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
        this.onReady();
    }

    styles = function () {
        return `
            <style lang="scss"> 
                ${CommonStyles}${this.pathToStyles}
            </style>`;
    };

    onReady() {
    }

    onAttributeChange(name, oldValue, newValue) {

    }

    onDisconnect() {

    }

    render(...args) {
        this.shadowRoot.innerHTML = '';
        const templateElem = document.createElement('template');
        templateElem.innerHTML = `${this.styles()}${this.template && this.template(...args)}`;
        this.shadowRoot.appendChild(templateElem.content.cloneNode(true));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue !== oldValue) {
            this.onAttributeChange(name, oldValue, newValue);
        }
    }

    disconnectedCallback() {
        this.onDisconnect();
    }

    static get observedAttributes() {
        return Object.values(this.attributes);
    }
}