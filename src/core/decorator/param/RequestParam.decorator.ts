import 'reflect-metadata';

export const REQUEST_PARAM_KEY = 'requestParam';

export function RequestParam(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (!propertyKey) {
            throw new Error('PropertyKey not defined');
        }
        const existingRequestParamParams: number[] =
            Reflect.getOwnMetadata(REQUEST_PARAM_KEY, target, propertyKey) || [];

        existingRequestParamParams.push(parameterIndex);
        Reflect.defineMetadata(REQUEST_PARAM_KEY, existingRequestParamParams, target, propertyKey);
    };
}
