import { RouteDefinition } from '../../../router/type/RouteDefinition.type';
import { HttpMethod } from '../../../http';

export function defineRouteMetadata(
    target: any,
    propertyKey: string | symbol,
    path: string,
    method: HttpMethod,
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
