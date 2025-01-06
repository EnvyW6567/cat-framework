import 'reflect-metadata';

export const AUTHENTICATION_KEY = 'authentication';

export function Authenticated(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if(!propertyKey) {
            throw new Error("PropertyKey not defined");
        }
        const existingAuthParams: number[] = Reflect.getOwnMetadata(AUTHENTICATION_KEY, target, propertyKey) || [];

        existingAuthParams.push(parameterIndex);
        Reflect.defineMetadata(AUTHENTICATION_KEY, existingAuthParams, target, propertyKey);
    };
}