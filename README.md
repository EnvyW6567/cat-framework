# Cat Framework

![Node.js Version](https://img.shields.io/badge/Node.js-22.11.0-green?logo=node.js)

Cat 프레임워크는 Node.js 환경에서 동작하는 웹 어플리케이션 서버를 제작하기 위한 프레임워크입니다. 현재 작성된 버전은 모듈을 제공하지 않으며 웹 어플리케이션 코드와 결합된 버전입니다.

---

## HTTP 모듈

Node.js 는 Http 모듈을 제공합니다. 그러나, Cat은 Http 모듈을 사용하지 않았습니다. Node의 저수준 TCP 통신 모듈인 `node:net` 모듈만을 사용해 Http 객체로 매핑하는 독자적인 모듈을 구현했습니다.

### Http 요청이 Cat의 TCP 포트를 통해 들어오게 되면,
1. 버퍼를 문자열로 변환하고
2. start-line을 파싱해 Http 규격을 검증하고
3. header와 body를 파싱해 Http 객체로 매핑합니다

- `interface/http/HttpRequest.ts`
``` javascript
export class HttpRequest {  
    readonly method: HttpMethodType;  
    readonly url: string;  
    readonly path: string;  
    readonly params: object;  
    readonly header: object;  
    readonly body: object | undefined;  
    readonly multiparts: MultipartType[] | undefined;  
    readonly ext: HttpContentTypeExt;  
    private authenticated: number | undefined;  
  
    constructor(httpRequestData: HttpRequestData) {  
        this.method = httpRequestData.method;  
        this.url = httpRequestData.url;  
        this.path = httpRequestData.path;  
        this.params = httpRequestData.params;  
        this.ext = this.validateExt(path.extname(this.url));  
        this.header = httpRequestData.headers;  
        this.body = httpRequestData.body;  
        this.multiparts = httpRequestData.multiparts;  
  
        this.logReq();  
    }  
	// ...
}
```

### 요청에 대한 비즈니스 로직을 처리하고 HttpResponse 데이터를 반환하면,
1. HttpResponse 데이터를 기반으로 응답 객체에 매핑하고
2. 응답 객체를 기반으로 Http 규격에 맞는 응답 문자열을 생성해
3. 클라이언트 요청에 대한 응답을 반환합니다



- `interface/http/HttpResponse.ts`
``` javascript
export class HttpResponse {  
    private readonly socket;  
    private readonly headers: Map<string, string>;  
    private body: Buffer | string;  
    private statusCode: HttpStatusType;  
  
    constructor(socket: net.Socket) {  
        this.socket = socket;  
        this.statusCode = 200;  
        this.headers = new Map<string, string>();  
        this.body = '';  
    }  
	// ...
}
```
---

## 미들웨어

Http 요청을 수신하면 핵심 로직을 처리하기 전에 미들웨어를 등록해 전처리 과정을 추가할 수 있습니다. 

- `main.ts` Express 프레임워크와 같이 체이닝을 통해 미들웨어를 등록할 수 있습니다.
``` javascript
this.server  
    .use(this.sessionHandler)  
    .use(this.router)  
    .use(this.exceptionHandler);
```
- 커스텀 핸들러를 미들웨어로 등락하려면 `Middleware`를 상속받아야합니다
``` javascript
export interface Middleware {  
    handle(req: HttpRequest, res: HttpResponse, next: Function, err?: Error): Promise<void>;  
}
```
- 예외처리 핸들러는 반드시 마지막 미들웨어로 등록해야합니다

---

## 라우터
라우터 핸들러는 기본적으로 제공되는 미들웨어로 Http 요청 URL을 적절한 비즈니스 로직을 호출합니다. Router는 Controller에서 정의된 `URL - method`를 매핑하여 URL별로 적절한 로직을 호출하도록 지원합니다.

- src/interface/router/Router.ts
``` javascript
@Injectable()  
export class Router implements Middleware {  
    private static readonly instance: Router | undefined;  
    private readonly routers: Routers;  
  
    constructor() {  
        this.routers = {  
            GET: {},  
            POST: {},  
            DELETE: {},  
            PUT: {},  
            PATCH: {},  
        };  
    }  
  
    static getInstance() {  
        if (!Router.instance) {  
            return DIContainer.getInstance().resolve<Router>('Router');  
        }  
        return Router.instance;  
    }  
  
    addRoute(method: HttpMethodType, path: string, handler: any) {  
        this.routers[method][path] = handler;  
    }  
  
    async handle(req: HttpRequest, res: HttpResponse, next: Function) {  
        const method = req.method;  
        const path = req.path;  
        const ext = req.ext;  
  
        if (ext) {  
            const buffer = await this.getStaticFile(ext, path);  
  
            res.setBody(buffer).setStatus(200).setContentType(HTTP_CONTENT_TYPE[ext]).send();  
  
            return;  
        }  
        this.validateRouter(method, path);  
  
        await this.routers[method][path](req, res);  
  
        next();  
    }  
  
    private async getStaticFile(ext: string, url: string) {  
        if (ext === '.html') {  
            return await fs.readFile(process.env.VIEW_FILE_PATH + url);  
        }  
        return await fs.readFile(process.env.STATIC_FILE_PATH + url);  
    }  
  
    private validateRouter(method: HttpMethodType, url: string) {  
        if (!this.routers[method]?.[url]) {  
            throw new HttpError(HttpErrorType.NOT_FOUND);  
        }  
    }  
}
```

---

## 의존성 주입 컨테이너

Cat 프레임워크는 의존성 주입 컨테이너를 지원하며 이로 인해 `제어 역전`을 실현합니다.

### ⚠️ Cat 프레임워크는 실행 전 반드시 빌드과정이 필요합니다.
Nest.js와 달리 별도의 모듈 파일을 생성하지 않고 의존성 주입 컨테이너를 관리합니다. 이는 Java의 JavaBean과 같은 동작을 구현하기 위한 독자적(사전 빌드가 필수인 이유)인 방식입니다.

빌드 타임에 `src/` 디렉토리 내 파일을 읽어 `@Injectable` , `@Service` , `@Controller` 와 같은 의존성 주입 클래스를 구분해 런타임 초기화 환경에서 `import`하는 역할을 합니다. 의존성 클래스는 재귀적으로 필요한 의존성 클래스를 탐색하며 의존성 주입 컨테이너에 객체로 등록합니다.
** `generateDependencies.ts` 파일 참조

- `src/core/container/DIContainer.ts`
``` javascript
export class DIContainer {  
    private static instance: DIContainer;  
    private constructors: Map<string, any> = new Map();  
  
    private instantiating: Set<string> = new Set();  
    private instances: Map<string, any> = new Map();  
  
    private constructor() {}  
  
    static getInstance(): DIContainer {  
        if (!DIContainer.instance) {  
            DIContainer.instance = new DIContainer();  
        }  
        return DIContainer.instance;  
    }  
  
    register(name: string, constructor: any): void {  
        this.constructors.set(name, constructor);  
    }  
  
    resolve<T>(name: string): T {  
        if (this.instances.has(name)) {  
            return this.instances.get(name);  
        }  
        const constructor = this.constructors.get(name);  
  
        if (!constructor) {  
            throw new Error(`Dependency not found: ${name}`);  
        }  
  
        this.instantiating.add(name);  
  
        try {  
            const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) || [];  
            const injectionTokens = Reflect.getMetadata('custom:paramtypes', constructor) || [];  
            const resolvedInjections = paramTypes.map((param: any, index: number) => {  
                const injectionToken = injectionTokens[index] || param.name;  
  
                return this.resolve(injectionToken);  
            });  
  
            const instance = new constructor(...resolvedInjections);  
            this.instances.set(name, instance);  
  
            return instance;  
        } finally {  
            this.instantiating.delete(name);  
        }  
    }  
  
    info() {  
        return this.constructors;  
    }  
}
```

---

## 커스텀 데코레이터

Cat 프레임워크는 여러 동작을 지원하는 데코레이터를 제공합니다.

- 의존성 주입 클래스 데코레이터 `@Service`, `@Repository`, `@Injectable`
- Http 요청 관련 데코레이터 `@Controller`, `@PostMapping`, `@GetMapping`, `@RequestBody`, `@RequestParam`, `@Multipart`

- `src/core/decorator/class/Injectable.decorator.ts`
``` javascript
function createInjectableDecorator(type: InjectableType) {  
    return function (name?: string): ClassDecorator {  
        return function (target: any) {  
            const dependencyName = name || target.name;  
  
            Reflect.defineMetadata('injectableType', type, target);  
  
            DIContainer.getInstance().register(dependencyName, target);  
  
            return target;  
        };  
    };  
}
```

- `src/core/decorator/class/Controller.decorator.ts`
``` javascript
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
```
