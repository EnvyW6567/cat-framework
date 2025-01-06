import {DIContainer} from "../../container/DIContainer";
import {RouteDefinition} from "../../../interface/router/RouteDefinition.type";
import {Router} from "../../../interface/router/Router";
import {BaseError} from "../../error/BaseError";
import {HttpResponse} from "../../../interface/http/HttpResponse";
import {HttpRequest} from "../../../interface/http/HttpRequest";
import {HttpResponseDto} from "../../../interface/http/HttpResponse.dto";
import {REQUEST_BODY_KEY} from "../param/RequestBody.decorator";
import {REQUEST_PARAM_KEY} from "../param/RequestParam.decorator";
import {plainToInstance} from "class-transformer";
import {validate} from "class-validator";
import {BaseError} from "../../error/BaseErrorType";
import {AUTHENTICATION_KEY} from "../param/Authenticated.decorator";
import {MULTIPART_KEY} from "../param/Multipart.decorator";

export function Controller(basePath: string = ''): ClassDecorator {
    return function (target: any) {
        Reflect.defineMetadata('isController', true, target);
        Reflect.defineMetadata('basePath', basePath, target);

        const router = DIContainer.getInstance().resolve<Router>("Router");

        if (!router) {
            throw new Error("Router is not registered in DIContainer");
        }

        registerRoutes(target, router, basePath);

        DIContainer.getInstance().register(target.name, target);
    };
}

function registerRoutes(target: any, router: Router, basePath: string) {
    const routes: RouteDefinition[] = Reflect.getMetadata('routes', target) || [];

    routes.forEach((route: RouteDefinition) => {
        const {method, path, handlerName} = route;
        const fullPath = `${basePath}${path}`;

        const handler = async (req: HttpRequest, res: HttpResponse) => {
            const instance = DIContainer.getInstance().resolve<typeof target>(target.name);
            const args: any[] = [];

            const authenticatedParam: number[] = Reflect.getOwnMetadata(AUTHENTICATION_KEY, target.prototype, handlerName) || [];
            const requestParamParams: number[] = Reflect.getOwnMetadata(REQUEST_PARAM_KEY, target.prototype, handlerName) || [];
            const requestBodyParams: number[] = Reflect.getOwnMetadata(REQUEST_BODY_KEY, target.prototype, handlerName) || [];
            const multipartParams: number[] = Reflect.getOwnMetadata(MULTIPART_KEY, target.prototype, handlerName) || [];

            const paramTypes = Reflect.getMetadata('design:paramtypes', target.prototype, handlerName);

            if (authenticatedParam.length > 0) mapAuthenticated(req, args, authenticatedParam);
            if (requestParamParams.length > 0) await mapRequestParam(req, args, requestParamParams, paramTypes);
            if (requestBodyParams.length > 0) await mapRequestBody(req, args, requestBodyParams, paramTypes);
            if (multipartParams.length > 0) await mapMultipart(req, args, multipartParams, paramTypes);

            const response: HttpResponseDto = await instance[handlerName].apply(instance, args);

            res.setBody(response.body)
                .setHeaders(response.header)
                .setStatus(response.status)
                .send()
        };

        router.addRoute(method, fullPath, handler);
    });
}

function mapAuthenticated(req: HttpRequest, args: any[], authenticationParams: number[]) {
    authenticationParams.forEach((index) => {
        args[index] = req.getAuthenticated();
    });

    return args;
}

async function mapRequestBody(req: HttpRequest, args: any[], requestBodyParams: number[], paramTypes: any[]) {
    const validatedParams = await validateParams(requestBodyParams, paramTypes, req.body);

    return mapValidatedParams(validatedParams, args);
}

async function mapRequestParam(req: HttpRequest, args: any[], requestParamParams: number[], paramTypes: any[]) {
    const validatedParams = await validateParams(requestParamParams, paramTypes, req.params);

    return mapValidatedParams(validatedParams, args);
}

async function mapMultipart(req: HttpRequest, args: any[], multipartParams: number[], paramTypes: any[]) {
    const validatedParams = await validateParams(multipartParams, paramTypes, req.multiparts);

    return mapValidatedParams(validatedParams, args);
}

async function validateParams(requestParams: number[], paramTypes: any[], value: any) {
    const validationPromises = requestParams.map(async (index) => {
        const paramType = paramTypes[index];

        if (paramType && typeof paramType === 'function') {
            const dto = plainToInstance(paramType, value);
            const errors = await validate(dto);

            if (errors.length > 0) {
                throw new BaseError(BaseError.BAD_REQUEST_PARAM);
            }
            return {index, value: dto};
        }
        return {index, value};
    });

    try {
        return await Promise.all(validationPromises);
    } catch (error) {
        if (error instanceof BaseError) {
            throw error;
        }
        throw new BaseError(BaseError.VALIDATION_ERROR);
    }
}


function mapValidatedParams(validatedParams: { index: number, value: any }[], args: any[]) {
    validatedParams.forEach(({index, value}) => {
        args[index] = value;
    });

    return args;
}
