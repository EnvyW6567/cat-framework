import {defineRouteMetadata} from "./RequestMapper.decorator";

export function GetMapping(path: string) {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        defineRouteMetadata(target, propertyKey, path, 'GET')

        return descriptor
    }
}