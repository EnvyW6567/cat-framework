import { CatContainer } from '../../container/Cat.container';
import { RouteDefinition } from '../../../router/type/RouteDefinition.type';
import { Router } from '../../../router/Router';
import { BaseError } from '../../error/BaseError';
import { HttpRequest, HttpResponse, HttpResponseEntity } from '../../../http';
import { AUTHENTICATION_KEY, MULTIPART_KEY, REQUEST_BODY_KEY, REQUEST_PARAM_KEY } from '../param';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BaseErrorType } from '../../error/BaseErrorType';
import { logger } from '../../logger/CatLogger';

type ParamMapper = (req: HttpRequest, index: number, paramType?: any) => Promise<any> | any

const paramMappers: Record<string, ParamMapper> = {
    [AUTHENTICATION_KEY]: (req, index) =>
        req.getAuthenticated(),
    [REQUEST_PARAM_KEY]: async (req, index, paramType) =>
        validateAndTransform(req.params, paramType),
    [REQUEST_BODY_KEY]: async (req, index, paramType) =>
        validateAndTransform(req.body, paramType),
    [MULTIPART_KEY]: async (req, index, paramType) =>
        validateAndTransform(req.multiparts, paramType),
};

const routeHandlerCache = new WeakMap<any, Map<string, Function>>();

export function Controller(basePath: string = ''): ClassDecorator {
    return function(target: any) {
        const router = CatContainer.getInstance().resolve<Router>('Router');

        if (!router) throw new Error('Router is not registered in CatContainer');

        Reflect.defineMetadata('isController', true, target);
        Reflect.defineMetadata('basePath', basePath, target);
        registerRoutes(target, router, basePath);
        CatContainer.getInstance().register(target.name, target);
    };
}

async function validateAndTransform(value: any, paramType: any) {
    if (!paramType || typeof paramType !== 'function') return value;

    const dto = plainToInstance(paramType, value);
    const errors = await validate(dto);

    if (errors.length > 0) {
        throw new BaseError(BaseErrorType.BAD_REQUEST_PARAM);
    }

    return dto;
}

function registerRoutes(target: any, router: Router, basePath: string) {
    const routes: RouteDefinition[] = Reflect.getMetadata('routes', target) || [];

    let handlerCache = routeHandlerCache.get(target);
    if (!handlerCache) {
        handlerCache = new Map();
        routeHandlerCache.set(target, handlerCache);
    }

    routes.forEach((route) => {
        const cacheKey = `${route.method}:${route.path}`;
        let handler = handlerCache.get(cacheKey);

        if (!handler) {
            const paramTypes = new Map(
                Object.entries(paramMappers).map(([key]) => [
                    key,
                    Reflect.getOwnMetadata(key, target.prototype, route.handlerName) || [],
                ]),
            );

            handler = createRouteHandler(target, route, paramTypes);
            handlerCache.set(cacheKey, handler);
        }

        const fullPath = `${basePath}${route.path}`;
        router.addRoute(route.method, fullPath, handler);
        logger.info('registered router : ' + route.path);
    });
}

function createRouteHandler(target: any, route: RouteDefinition, paramTypes: Map<string, number[]>) {
    const methodParamTypes = Reflect.getMetadata('design:paramtypes', target.prototype, route.handlerName);
    const paramTypeEntries = Array.from(paramTypes.entries());

    return async (req: HttpRequest, res: HttpResponse) => {
        const instance = CatContainer.getInstance().resolve<typeof target>(target.name);
        const args = new Array(methodParamTypes?.length || 0);

        for (const [key, indices] of paramTypeEntries) {
            const mapper = paramMappers[key];
            for (const index of indices) {
                args[index] = await mapper(req, index, methodParamTypes[index]);
            }
        }

        const response: HttpResponseEntity = await instance[route.handlerName].apply(instance, args);
        res.setBody(response.body).setHeaders(response.header).setStatus(response.status).send();
    };
}