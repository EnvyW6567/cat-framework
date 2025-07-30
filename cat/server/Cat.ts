import { CatContainer } from '../core/container/Cat.container'
import {DependencyScanner} from "../core/container/DependencyScanner";
import {Router} from "../router/Router";

export class Cat {
    private static instance: Cat
    private initialized = false

    constructor() {}

    static getInstance(): Cat {
        if (!Cat.instance) {
            Cat.instance = new Cat()
        }
        return Cat.instance
    }

    async bootstrap<T>(ApplicationClass: new(...args: any[]) => T): Promise<T> {
        if (!this.initialized) {
            await this.initialize();
            this.initialized = true;
        }
        const container = CatContainer.getInstance()

        container.register(ApplicationClass.name, ApplicationClass)

        return container.resolve<T>(ApplicationClass.name)
    }

    private async initialize(): Promise<void> {
        const container = CatContainer.getInstance();

        container.register('CatContainer', CatContainer);
        container.register('Router', Router);

        await DependencyScanner.scan('src');
    }

}
