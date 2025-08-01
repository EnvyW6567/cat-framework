export class CatContainer {
    private static instance: CatContainer

    private constructors: Map<string, any> = new Map() // 의존성 클래스 생성자 저장소
    private instances: Map<string, any> = new Map() // 의존성 실제 객체 저장소
    private instantiating: Set<string> = new Set() // 순환 의존성 방지를 위한 객체 정보 저장소

    private constructor() {}

    static getInstance(): CatContainer {
        if (!CatContainer.instance) {
            CatContainer.instance = new CatContainer()
        }
        return CatContainer.instance
    }

    register(name: string, constructor: any): void {
        this.constructors.set(name, constructor)
    }

    resolve<T>(name: string): T {
        if (this.instances.has(name)) {
            return this.instances.get(name)
        }

        if (this.instantiating.has(name)) {
            throw new Error(`Circular dependency detected : ${name}`)
        }

        const constructor = this.constructors.get(name)

        if (!constructor) {
            throw new Error(`Dependency not found: ${name}`)
        }

        this.instantiating.add(name)

        try {
            const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) || []
            const injectionTokens = Reflect.getMetadata('custom:paramtypes', constructor) || []
            const resolvedInjections = paramTypes.map((param: any, index: number) =>
                this.resolve(injectionTokens[index] || param.name))

            const instance = new constructor(...resolvedInjections)

            this.instances.set(name, instance)

            return instance
        } finally {
            this.instantiating.delete(name)
        }
    }

    info() {
        return this.constructors
    }
}
