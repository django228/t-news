import { apiUrl } from '../baseUrl';

export function ConfigService() {
    async function getChartsConfig() {
        const data = await fetch(`${apiUrl}/config`);
        const json = await data.json();
        return new Map(json);
    }

    return {
        getChartsConfig
    };
}