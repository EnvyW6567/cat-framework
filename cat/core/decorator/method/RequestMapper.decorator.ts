import { RouteDefinition } from '../../../router/RouteDefinition.type'
import { HttpMethodType } from '../../../http/type/HttpMethod.type'

export function defineRouteMetadata(
    target: any,
    propertyKey: string | symbol,
    path: string,
    method: HttpMethodType,
) {
    if (!Reflect.hasMetadata('routes', target.constructor)) {
        Reflect.defineMetadata('routes', [], target.constructor)
    }

    const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[]

    routes.push({
        path,
        method,
        handlerName: propertyKey,
    })

    Reflect.defineMetadata('routes', routes, target.constructor)
}
