import 'reflect-metadata'
import { DIContainer } from '../../container/DIContainer'

type InjectableType = 'controller' | 'service' | 'repository' | 'injectable'

function createInjectableDecorator(type: InjectableType) {
    return function (name?: string): ClassDecorator {
        return function (target: any) {
            const dependencyName = name || target.name

            Reflect.defineMetadata('injectableType', type, target)

            DIContainer.getInstance().register(dependencyName, target)

            return target
        }
    }
}

export const Injectable = createInjectableDecorator('injectable')
export const Service = createInjectableDecorator('service')
export const Repository = createInjectableDecorator('repository')
