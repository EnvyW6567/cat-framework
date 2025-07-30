import {defineRouteMetadata} from "./RequestMapper.decorator";

export function PostMapping(path: string) {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        defineRouteMetadata(target, propertyKey, path, 'POST')

        return descriptor
    }
}