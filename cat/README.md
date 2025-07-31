# Cat Framework

[![npm version](https://img.shields.io/npm/v/@envyw/cat-framework.svg)](https://www.npmjs.com/package/@envyw/cat-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.11.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.6.2-blue.svg)](https://www.typescriptlang.org/)

## **🚀 주요 특징**

#### 🎯 **데코레이터 기반의 현대적이고 선언적인 개발 방식**

#### 📦 **독자적인 의존성 주입 컨테이너로 자동 의존성 주입을 통한 깔끔한 아키텍처**

#### 🔧 **Express 스타일의 직관적이고 유연한 미들웨어 시스템**

#### 📁 **내장 파일 업로드 multipart/form-data 를 위한 별도 라이브러리 불필요**

### **🍃 Spring-Like Node.js 웹 프레임워크**

Cat Framework는 TypeScript 데코레이터의 힘을 활용하여 깔끔하고 직관적인 API를 제공하는 차세대 웹 프레임워크입니다. 복잡한 설정 없이 강력한 의존성 주입을 지원합니다.

```typescript

@Controller('/api/users')
export class UserController {
    @GetMapping('/')
    async getUsers(): Promise<HttpResponseEntity> {
        return new HttpResponseEntity({ users: await this.userService.findAll() });
    }
}
```

### **🏗️ Spring 스타일 의존성 주입**

생성자 파라미터를 통한 직관적인 의존성 주입으로 Spring 개발자들에게 친숙한 인터페이스를 제공합니다.

```typescript

@Service()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {
    }

    async findAll() {
        return this.userRepository.findAll();
    }
}

@Controller('/users')
export class UserController {
    constructor(private readonly userService: UserService) {
    } // 자동 주입!

    @GetMapping('/')
    async getUsers(): Promise<HttpResponseEntity> {
        const users = await this.userService.findAll();
        return new HttpResponseEntity({ users });
    }
}
```

### **🔄 다형성 지원 의존성 주입**

인터페이스 기반 개발과 `@Inject` 데코레이터를 통해 구현체를 자유롭게 교체할 수 있습니다.

```typescript
// 인터페이스 정의
interface UserRepository {
    findAll(): Promise<User[]>;

    findById(id: number): Promise<User>;
}

// 다양한 구현체
@Repository("UserMysqlRepository")
export class UserMysqlRepository implements UserRepository {
    async findAll() { /* MySQL 구현 */
    }

    async findById(id: number) { /* MySQL 구현 */
    }
}

@Repository("UserMongoRepository")
export class UserMongoRepository implements UserRepository {
    async findAll() { /* MongoDB 구현 */
    }

    async findById(id: number) { /* MongoDB 구현 */
    }
}

// 구현체 선택적 주입
@Service()
export class UserService {
    constructor(
        @Inject("UserMysqlRepository") private readonly userRepository: UserRepository
    ) {
    }

    // 테스트 환경에서는 Mock 주입 가능
    // @Inject("UserMockRepository") private readonly userRepository: UserRepository
}
```

### **🔍 자동 파일 스캐닝**

복잡한 모듈 등록이나 import 관리 없이, 파일 스캐닝을 통해 자동으로 의존성을 발견하고 등록합니다:

```typescript
// 이런 복잡한 설정은 필요 없습니다!
// app.module.ts ❌
// const app = new App([UserController, UserService, UserRepository]);

// 그냥 데코레이터만 붙이면 끝! ✅
@Controller('/users')  // 자동 스캔 & 등록
export class UserController {
...
}

@Service()            // 자동 스캔 & 등록  
export class UserService {
...
}
```

## 🌱 설치

```bash
npm install @envyw/cat-framework reflect-metadata class-transformer class-validator
```

다른 패키지 매니저도 사용할 수 있습니다:

```bash
yarn add @envyw/cat-framework reflect-metadata class-transformer class-validator
pnpm add @envyw/cat-framework reflect-metadata class-transformer class-validator
bun add @envyw/cat-framework reflect-metadata class-transformer class-validator
```

## 🏗️ 사용법

### `App.ts`

미들웨어 체이닝을 통해 라우터를 등록하세요. 그리고 서버를 실행 함수를 등록하세요.

```typescript
import { CatServer, Injectable } from '@envyw/cat-framework';

@Injectable()
export class App {
    constructor(
        private readonly router: Router,
        private readonly server: CatServer,
    ) {
    }

    async start() {
        await this.configureServer()

        await this.server.create()
        await this.server.listen(3001)
    }

    private async configureServer() {
        this.server
            .use(this.router)
    }
}

```

### `main.ts`

main 진입점에서 cat 함수로 App을 등록하고 실행하세요.

```typescript
import { cat } from '@envyw/cat-framework';

cat(App).then(app => app.start())
```

### 실행

⚠️ typescript JIT transform 모듈을 사용해서 실행해야합니다. (보완 중)

```bash
$ ts-node main.ts
Server running on port 3000
```

## 🎯 컨트롤러 정의

```typescript
// user.controller.ts
import { Controller, GetMapping, PostMapping, RequestBody, HttpResponseEntity } from '@envyw/cat-framework';

@Controller('/users')
export class UserController {
    @GetMapping('/')
    async getUsers(): Promise<HttpResponseEntity> {
        return new HttpResponseEntity({ users: [] }, 200);
    }

    @PostMapping('/')
    async createUser(@RequestBody() body: any): Promise<HttpResponseEntity> {
        return new HttpResponseEntity({ message: '사용자가 생성되었습니다', user: body }, 201);
    }
}
```

## 📦 의존성 주입

```typescript
// user.service.ts
import { Service } from '@envyw/cat-framework';

@Service()
export class UserService {
    async findAll() {
        return [{ id: 1, name: '홍길동' }];
    }
}

// user.controller.ts
@Controller('/users')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @GetMapping('/')
    async getUsers(): Promise<HttpResponseEntity> {
        const users = await this.userService.findAll();
        return new HttpResponseEntity({ users }, 200);
    }
}
```

## 🔧 미들웨어

```typescript
import { Injectable, Middleware, HttpRequest, HttpResponse } from '@envyw/cat-framework';

@Injectable()
export class LoggerMiddleware implements Middleware {
    async handle(req: HttpRequest, res: HttpResponse, next: Function): Promise<void> {
        console.log(`${req.method} ${req.path}`);
        next();
    }
}

// 미들웨어 등록
@Injectable()
export class App {
    constructor(
        private readonly server: CatServer,
        private readonly loggerMiddleware: LoggerMiddleware
    ) {
    }

    async start() {
        this.server.use(this.loggerMiddleware);
        await this.server.create();
        await this.server.listen(3000);
    }
}
```

## 📁 파일 업로드

```typescript

@Controller('/upload')
export class UploadController {
    @PostMapping('/')
    async uploadFile(@Multipart() files: any[]): Promise<HttpResponseEntity> {
        return new HttpResponseEntity({
            message: '파일이 업로드되었습니다',
            count: files.length
        });
    }
}
```

## 🔐 인증

```typescript

@Controller('/protected')
export class ProtectedController {
    @GetMapping('/profile')
    async getProfile(@Authenticated() userId: number): Promise<HttpResponseEntity> {
        return new HttpResponseEntity({ userId, message: '인증된 사용자' });
    }
}
```

## 📖 API 문서

### 데코레이터

Cat Framework는 다음 데코레이터들을 제공합니다:

#### 클래스 데코레이터

- `@Controller(basePath?)` - 컨트롤러 클래스 정의
- `@Service()` - 서비스 클래스 표시
- `@Repository()` - 레포지토리 클래스 표시
- `@Injectable()` - 주입 가능한 클래스 표시

#### 메서드 데코레이터

- `@GetMapping(path)` - GET 요청 라우팅
- `@PostMapping(path)` - POST 요청 라우팅

#### 파라미터 데코레이터

- `@RequestBody()` - 요청 본문 주입
- `@RequestParam()` - 쿼리 파라미터 주입
- `@Multipart()` - 멀티파트 파일 주입
- `@Authenticated()` - 인증된 사용자 ID 주입
- `@Inject(token)` - 커스텀 의존성 주입

### 핵심 클래스

#### `HttpResponseEntity` 응답 데이터 래핑 엔터티

```typescript
const response = new HttpResponseEntity(body, status, headers);
```

**기본값**: `body = {}`, `status = 200`, `headers = {}`

#### `Middleware` 미들웨어 인터페이스

```typescript
interface Middleware {
    handle(req: HttpRequest, res: HttpResponse, next: Function, err?: Error): Promise<void>
}
```

### 설정 옵션

#### 환경 변수

Cat Framework는 다음 환경 변수들을 지원합니다.

- `CAT_LOG_LEVEL` - 로깅 레벨 설정 (`ERROR`, `WARN`, `INFO`, `DEBUG`)
- `VIEW_FILE_PATH` - HTML 파일 경로
- `STATIC_FILE_PATH` - 정적 파일 경로

#### TypeScript 설정

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true
  }
}
```

## ❓ FAQ

### 컨트롤러가 등록되지 않아요

가장 가능성이 높은 원인은 컨트롤러 파일이 올바른 위치에 있지 않기 때문입니다. `src/` 디렉토리 내에 있는지 확인하세요.

디버그 모드를 켜고 다시 시도해보세요:

```bash
CAT_LOG_LEVEL=DEBUG node main.js
```

콘솔에 도움이 되는 오류 메시지가 출력됩니다.

### 미들웨어가 실행되지 않아요

미들웨어가 `server.create()` 전에 등록되었는지 확인하세요:

```typescript
async
start()
{
    this.server.use(this.middleware); // create() 전에 등록
    await this.server.create();
    await this.server.listen(3000);
}
```

### 요청 본문을 읽을 수 없어요

`Content-Type` 헤더가 `application/json`으로 설정되었는지 확인하세요. Cat Framework는 현재 JSON 형태의 요청 본문만 지원합니다.

### TypeScript에서 타입 오류가 발생해요

`reflect-metadata`를 import했는지 확인하고, `tsconfig.json`에서 데코레이터 설정이 활성화되어 있는지 확인하세요:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 정적 파일을 제공할 수 있나요?

네! 환경 변수를 설정하세요:

```bash
STATIC_FILE_PATH=./public
VIEW_FILE_PATH=./views
```

이제 정적 파일들이 자동으로 제공됩니다.

## 의존성

- `reflect-metadata` - 데코레이터 메타데이터 (필수)
- `class-transformer` - DTO 변환
- `class-validator` - 요청 검증
