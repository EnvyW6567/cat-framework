import { CatContainer } from './core/container/Cat.container';
import { DependencyScanner } from './core/container/DependencyScanner';
import { Router } from './router/Router';
import { CatServer } from './server/Cat.server';

export class Cat {
    private static instance: Cat;
    private initialized = false;

    constructor() {
    }

    static getInstance(): Cat {
        if (!Cat.instance) {
            Cat.instance = new Cat();
        }
        return Cat.instance;
    }

    async bootstrap<T>(ApplicationClass: new(...args: any[]) => T): Promise<T> {
        if (!this.initialized) {
            await this.initialize();
            this.initialized = true;
        }
        const container = CatContainer.getInstance();

        container.register(ApplicationClass.name, ApplicationClass);

        return container.resolve<T>(ApplicationClass.name);
    }

    private async initialize(): Promise<void> {
        const container = CatContainer.getInstance();

        container.register('CatContainer', CatContainer);
        container.register('Router', Router);
        container.register('CatServer', CatServer);

        await DependencyScanner.scan('src');
    }
}

export async function cat<T>(ApplicationClass: new(...args: any[]) => T): Promise<T> {
    return Cat.getInstance().bootstrap(ApplicationClass);
}
