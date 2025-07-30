import 'reflect-metadata'

export const MULTIPART_KEY = 'multipart'

export function Multipart(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (!propertyKey) {
            throw new Error('PropertyKey not defined')
        }
        const existingMultipartParams: number[] =
            Reflect.getOwnMetadata(MULTIPART_KEY, target, propertyKey) || []

        existingMultipartParams.push(parameterIndex)
        Reflect.defineMetadata(MULTIPART_KEY, existingMultipartParams, target, propertyKey)
    }
}
