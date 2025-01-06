export class DIContainer {
    private static instance: DIContainer;
    private constructors: Map<string, any> = new Map();

    private instantiating: Set<string> = new Set();
    private instances: Map<string, any> = new Map();

    private constructor() {
    }

    static getInstance(): DIContainer {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }

    register(name: string, constructor: any): void {
        this.constructors.set(name, constructor);
    }

    resolve<T>(name: string): T {
        if (this.instances.has(name)) {
            return this.instances.get(name);
        }
        const constructor = this.constructors.get(name);

        if (!constructor) {
            throw new Error(`Dependency not found: ${name}`);
        }

        this.instantiating.add(name);

        try {
            const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) || [];
            const injectionTokens = Reflect.getMetadata('custom:paramtypes', constructor) || [];
            const resolvedInjections = paramTypes.map((param: any, index: number) => {
                const injectionToken = injectionTokens[index] || param.name;

                return this.resolve(injectionToken);
            });

            const instance = new constructor(...resolvedInjections);
            this.instances.set(name, instance);

            return instance;
        } finally {
            this.instantiating.delete(name);
        }
    }

    info() {
        return this.constructors;
    }
}