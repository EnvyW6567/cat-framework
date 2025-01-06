import {DIContainer} from "../../../src/core/container/DIContainer";
import {Injectable} from "../../../src/core/decorator/class/Injectable.decorator";

describe('@Injectable 테스트', () => {
    let container: DIContainer;

    beforeEach(() => {
        container = DIContainer.getInstance();
        container['constructors'].clear();
        container['instances'].clear();
    });

    test('DIContainer에 클래스를 지연 등록하고 해결해야 함', () => {
        @Injectable()
        class TestClass {
            getName() {
                return 'TestClass';
            }
        }

        const instance = container.resolve<TestClass>('TestClass');

        expect(instance).toBeInstanceOf(TestClass);
        expect(instance.getName()).toBe('TestClass');
        expect(container['constructors'].has('TestClass')).toBeTruthy();
    });

    test('싱글톤 인스턴스를 유지해야 함', () => {
        @Injectable()
        class SingletonTest {
        }

        const instance1 = container.resolve<SingletonTest>('SingletonTest');
        const instance2 = container.resolve<SingletonTest>('SingletonTest');

        expect(instance1).toBe(instance2);
    });

    test('의존성을 처리해야 함', () => {
        @Injectable()
        class DependencyClass {
            getName() {
                return 'Dependency';
            }
        }

        @Injectable()
        class MainClass {
            constructor(public dependency: DependencyClass) {
            }
        }

        const mainInstance = container.resolve<MainClass>('MainClass');

        expect(mainInstance).toBeInstanceOf(MainClass);
        expect(mainInstance.dependency).toBeInstanceOf(DependencyClass);
        expect(mainInstance.dependency.getName()).toBe('Dependency');
    });
});
