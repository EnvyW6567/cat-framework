import 'reflect-metadata';

export const REQUEST_BODY_KEY = 'requestBody';

export function RequestBody(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if(!propertyKey) {
            throw new Error("PropertyKey not defined");
        }
        const existingRequestBodyParams: number[] = Reflect.getOwnMetadata(REQUEST_BODY_KEY, target, propertyKey) || [];

        existingRequestBodyParams.push(parameterIndex);
        Reflect.defineMetadata(REQUEST_BODY_KEY, existingRequestBodyParams, target, propertyKey);
    };
}
