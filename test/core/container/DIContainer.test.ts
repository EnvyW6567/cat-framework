import 'reflect-metadata'
import {CatContainer} from "../../../cat/core/container/Cat.container"

describe('CatContainer 테스트', () => {
    let container: CatContainer

    beforeEach(() => {
        container = CatContainer.getInstance()
    })

    afterEach(() => {
        (CatContainer as any).instance = null
    })

    test('싱글톤 인스턴스 생성해야 함', () => {
        const instance1 = CatContainer.getInstance()
        const instance2 = CatContainer.getInstance()
        expect(instance1).toBe(instance2)
    })

    test('의존성을 등록하고 해결해야 함', () => {
        class TestClass {}
        container.register('TestClass', TestClass)
        const resolved = container.resolve<TestClass>('TestClass')
        expect(resolved).toBeInstanceOf(TestClass)
    })

    test('생성자 주입을 통해 의존성을 해결해야 함', () => {
        class Dependency {}
        class TestClass {
            constructor(public dependency: Dependency) {}
        }
        Reflect.defineMetadata('design:paramtypes', [Dependency], TestClass)

        container.register('Dependency', Dependency)
        container.register('TestClass', TestClass)

        const resolved = container.resolve<TestClass>('TestClass')
        expect(resolved).toBeInstanceOf(TestClass)
        expect(resolved.dependency).toBeInstanceOf(Dependency)
    })

    test('등록되지 않은 의존성에 대해 오류를 발생시켜야 함', () => {
        expect(() => container.resolve('UnregisteredClass')).toThrow('Dependency not found: UnregisteredClass')
    })

    test('등록된 의존성에 대한 정보를 반환해야 함', () => {
        class TestClass1 {}
        class TestClass2 {}

        container.register('TestClass1', TestClass1)
        container.register('TestClass2', TestClass2)

        const info = container.info()
        expect(info.size).toBe(2)
        expect(info.get('TestClass1')).toBe(TestClass1)
        expect(info.get('TestClass2')).toBe(TestClass2)
    })
})