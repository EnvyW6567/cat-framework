export function Inject(token: string): ParameterDecorator {
    return function (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) {
        const existingInjectionTokens = Reflect.getMetadata('custom:paramtypes', target) || [];

        existingInjectionTokens[parameterIndex] = token;
        Reflect.defineMetadata('custom:paramtypes', existingInjectionTokens, target);
    }
}