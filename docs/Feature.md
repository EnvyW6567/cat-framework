# Cat Framework

<img src="https://github.com/user-attachments/assets/704142da-eb93-4662-8ee7-c2f82c79ef81" style="width: 120px; height: 120px">

![Node.js Version](https://img.shields.io/badge/Node.js-22.11.0-green?logo=node.js)

Cat Framework는 **Node.js 환경에서 동작하는 웹 애플리케이션 서버를 개발하기 위한 프레임워크**입니다.

---

## 🚀 독자적인 HTTP 모듈

Node.js의 기본 `http` 모듈을 사용하지 않고, **저수준 TCP 통신 모듈(`node:net`)을 활용하여 자체 HTTP 객체 매핑 모듈을 구현**했습니다.

### 📩 HTTP 요청 처리 과정

1️⃣ **TCP 포트로 HTTP 요청을 수신**

2️⃣ **버퍼를 문자열로 변환** 후, start-line을 파싱하여 HTTP 규격 검증

3️⃣ **헤더와 바디를 파싱**하여 `HttpRequest` 객체로 매핑

- `interface/http/HttpRequest.ts`

``` typescript
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
}
```

### 📤 HTTP 응답 처리 과정

1️⃣ **`HttpResponse` 객체에 데이터 매핑**

2️⃣ **HTTP 규격에 맞는 응답 문자열 생성**

3️⃣ **클라이언트에게 응답 반환**

- `interface/http/HttpResponse.ts`

```typescript
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
}
```

---

## 🔧 미들웨어

HTTP 요청을 처리하기 전에 **미들웨어를 등록하여 전처리 과정**을 추가할 수 있습니다.

### ✅ 미들웨어 등록 방식

- `main.ts`에서 체이닝을 통해 미들웨어를 순차적으로 등록할 수 있습니다.

``` typescript
this.server  
    .use(this.sessionHandler)  
    .use(this.router)  
    .use(this.exceptionHandler);
```

- **커스텀 미들웨어 등록**은 `Middleware` 인터페이스를 상속받아야 합니다.

``` typescript
export interface Middleware {
    handle(req: HttpRequest, res: HttpResponse, next: Function, err?: Error): Promise<void>;
}
```

- ⚠️ **예외 처리 핸들러는 반드시 마지막 미들웨어로 등록해야 합니다.**

---

## 🔀 라우터

Cat Framework의 라우터는 **URL과 HTTP 메서드를 매핑하여 적절한 비즈니스 로직을 실행**하는 역할을 합니다.

- `Router.ts`

``` typescript
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
}
```

---

## 🏗️ 의존성 주입 (DI) 컨테이너

Cat Framework는 **의존성 주입 컨테이너(Cat Container)를 지원**하여 **제어의 역전(Inversion of Control, IoC)**을 실현합니다.

### 파일 스캐닝 및 AST 변환을 통해 의존성 객체 등록 방식

Cat Framework는 런타임에 파일 스캐닝 및 AST 변환을 통해 의존성 클래스를 식별합니다.

```typescript
export class DependencyScanner {
    static async scan(baseDir: string = 'src'): Promise<void> {
        // 정적 파일 스캐닝
        // AST 변환 및 데코레이터 기반 의존성 클래스 식별
        // Cat Container에 의존성 객체 및 외부 의존성 주입 파라미터의 객체 생성자 등록 
    }
}
```

---

## 🎨 커스텀 데코레이터

Cat Framework는 **의존성 주입 및 HTTP 요청 처리를 위한 다양한 데코레이터를 제공합니다.**

### 주요 데코레이터

- `@Controller`, `@Service`, `@Repository`, `@Injectable` → **계층 별 의존성 주입 클래스**
- `@PostMapping`, `@GetMapping` → **HTTP 라우팅 메서드**
- `@RequestBody`, `@RequestParam`, `@Multipart` → **HTTP 요청 파라미터**

``` typescript
function createInjectableDecorator(type: InjectableType) {
    return function (name?: string): ClassDecorator {
        return function (target: any) {
            const dependencyName = name || target.name;
            Reflect.defineMetadata('injectableType', type, target);
            CatContainer.getInstance().register(dependencyName, target);
            return target;
        };
    };
}
```

- `Controller.decorator.ts`

``` typescript
export function Controller(basePath: string = ''): ClassDecorator {
    return function (target: any) {
        const router = CatContainer.getInstance().resolve<Router>('Router');
        if (!router) throw new Error('Router is not registered in CatContainer');
        Reflect.defineMetadata('isController', true, target);
        Reflect.defineMetadata('basePath', basePath, target);
        CatContainer.getInstance().register(target.name, target);
    };
}
```


