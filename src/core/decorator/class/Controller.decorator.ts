import { DIContainer } from '../../container/DIContainer';
import { RouteDefinition } from '../../../interface/router/RouteDefinition.type';
import { Router } from '../../../interface/router/Router';
import { BaseError } from '../../error/BaseError';
import { HttpResponse } from '../../../interface/http/HttpResponse';
import { HttpRequest } from '../../../interface/http/HttpRequest';
import { HttpResponseDto } from '../../../interface/http/HttpResponse.dto';
import { REQUEST_BODY_KEY } from '../param/RequestBody.decorator';
import { REQUEST_PARAM_KEY } from '../param/RequestParam.decorator';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BaseErrorType } from '../../error/BaseErrorType';
import { AUTHENTICATION_KEY } from '../param/Authenticated.decorator';
import { MULTIPART_KEY } from '../param/Multipart.decorator';

export function Controller(basePath: string = ''): ClassDecorator {
    return function (target: any) {
        const router = DIContainer.getInstance().resolve<Router>('Router');

        if (!router) throw new Error('Router is not registered in DIContainer');

        Reflect.defineMetadata('isController', true, target);
        Reflect.defineMetadata('basePath', basePath, target);
        registerRoutes(target, router, basePath);
        DIContainer.getInstance().register(target.name, target);
    };
}

type ParamMapper = (req: HttpRequest, index: number, paramType?: any) => Promise<any> | any;

const paramMappers: Record<string, ParamMapper> = {
    [AUTHENTICATION_KEY]: (req, index) => req.getAuthenticated(),
    [REQUEST_PARAM_KEY]: async (req, index, paramType) =>
        validateAndTransform(req.params, paramType),
    [REQUEST_BODY_KEY]: async (req, index, paramType) => validateAndTransform(req.body, paramType),
    [MULTIPART_KEY]: async (req, index, paramType) =>
        validateAndTransform(req.multiparts, paramType),
};

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

    routes.forEach((route) => {
        const paramTypes = new Map(
            Object.entries(paramMappers).map(([key, mapper]) => [
                key,
                Reflect.getOwnMetadata(key, target.prototype, route.handlerName) || [],
            ]),
        );

        const fullPath = `${basePath}${route.path}`;
        router.addRoute(route.method, fullPath, createRouteHandler(target, route, paramTypes));
    });
}

function createRouteHandler(
    target: any,
    route: RouteDefinition,
    paramTypes: Map<string, number[]>,
) {
    return async (req: HttpRequest, res: HttpResponse) => {
        const instance = DIContainer.getInstance().resolve<typeof target>(target.name);
        const methodParamTypes = Reflect.getMetadata(
            'design:paramtypes',
            target.prototype,
            route.handlerName,
        );
        const args = new Array(methodParamTypes.length);

        await Promise.all(
            Array.from(paramTypes.entries()).map(async ([key, indices]) => {
                const mapper = paramMappers[key];
                await Promise.all(
                    indices.map(async (index) => {
                        args[index] = await mapper(req, index, methodParamTypes[index]);
                    }),
                );
            }),
        );

        const response: HttpResponseDto = await instance[route.handlerName].apply(instance, args);
        res.setBody(response.body).setHeaders(response.header).setStatus(response.status).send();
    };
}
