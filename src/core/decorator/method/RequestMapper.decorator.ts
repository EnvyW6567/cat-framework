import { RouteDefinition } from '../../../interface/router/RouteDefinition.type';
import { HttpMethodType } from '../../../interface/http/type/HttpMethod.type';

export function GetMapping(path: string) {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        defineRouteMetadata(target, propertyKey, path, 'GET');

        return descriptor;
    };
}

export function PostMapping(path: string) {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        defineRouteMetadata(target, propertyKey, path, 'POST');

        return descriptor;
    };
}

function defineRouteMetadata(
    target: any,
    propertyKey: string | symbol,
    path: string,
    method: HttpMethodType,
) {
    if (!Reflect.hasMetadata('routes', target.constructor)) {
        Reflect.defineMetadata('routes', [], target.constructor);
    }

    const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];

    routes.push({
        path,
        method,
        handlerName: propertyKey,
    });

    Reflect.defineMetadata('routes', routes, target.constructor);
}
