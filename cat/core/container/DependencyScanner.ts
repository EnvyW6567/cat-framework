import {CatContainer} from "./Cat.container";
import ts from "typescript";
import fs from "fs/promises";
import path from "path";

type DependencyInfo = {
    className: string
    filePath: string
    decoratorType: 'Injectable' | 'Service' | 'Repository' | 'Controller'
}

export class DependencyScanner {
    private static cache = new Map<string, DependencyInfo[]>();
    private static readonly DEPENDENCY_DECORATORS = new Set([
        'Injectable', 'Service', 'Repository', 'Controller'
    ]);

    static async scan(baseDir: string = 'src'): Promise<void> {
        const startTime = performance.now();
        const container = CatContainer.getInstance();

        const cacheKey = await this.generateCacheKey(baseDir);
        let dependencies = this.cache.get(cacheKey);

        if (!dependencies) {
            dependencies = await this.scanDependencies(baseDir);
            console.log("Not Cached : ", dependencies)
            this.cache.set(cacheKey, dependencies);
        }

        this.registerDependencies(dependencies, container);

        console.log(`Dependencies scanned in ${performance.now() - startTime}ms`);
        console.log(`Found ${dependencies.length} injectable classes`);
    }

    private static async scanDependencies(baseDir: string): Promise<DependencyInfo[]> {
        const dependencies: DependencyInfo[] = [];
        const tsFiles = await this.getTsFiles(baseDir);

        const compilerOptions: ts.CompilerOptions = {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.CommonJS,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            allowJs: false
        };

        const program = ts.createProgram(tsFiles, compilerOptions);
        const typeChecker = program.getTypeChecker();

        for (const sourceFile of program.getSourceFiles()) {
            if (!sourceFile.fileName.includes('node_modules')) {
                this.visitNode(sourceFile, dependencies, typeChecker);
            }
        }

        return dependencies;
    }

    private static visitNode(
        node: ts.Node,
        dependencies: DependencyInfo[],
        typeChecker: ts.TypeChecker
    ): void {
        // 클래스 선언만 처리
        if (ts.isClassDeclaration(node) && node.name) {
            const decoratorInfo = this.extractDecoratorInfo(node);

            if (decoratorInfo) {
                const className = node.name.text;
                const filePath = node.getSourceFile().fileName;

                dependencies.push({
                    className,
                    filePath,
                    decoratorType: decoratorInfo
                });
            }
        }

        // 자식 노드 순회
        ts.forEachChild(node, (child) => this.visitNode(child, dependencies, typeChecker));
    }

    private static extractDecoratorInfo(
        node: ts.ClassDeclaration
    ): 'Injectable' | 'Service' | 'Repository' | 'Controller' | null {
        const modifiers = node.modifiers;

        if (!modifiers) return null;

        const decorators = ts.getDecorators?.(node) ||
            (node as any).decorators ||
            (node.modifiers?.filter(ts.isDecorator) as ts.Decorator[]) ||
            [];

        for (const decorator of decorators) {
            if (ts.isCallExpression(decorator.expression)) {
                const decoratorName = decorator.expression.expression.getText();
                if (this.DEPENDENCY_DECORATORS.has(decoratorName)) {
                    return decoratorName as any;
                }
            } else if (ts.isIdentifier(decorator.expression)) {
                const decoratorName = decorator.expression.text;
                if (this.DEPENDENCY_DECORATORS.has(decoratorName)) {
                    return decoratorName as any;
                }
            }
        }
        return null;
    }

    private static async getTsFiles(dir: string): Promise<string[]> {
        const files: string[] = [];

        const scan = async (currentDir: string) => {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
                    await scan(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
                    files.push(fullPath);
                }
            }
        };

        await scan(dir);
        return files;
    }

    private static registerDependencies(
        dependencies: DependencyInfo[],
        container: CatContainer
    ): void {
        for (const dep of dependencies) {
            try {
                const module = require(this.resolvePath(dep.filePath));
                const ClassConstructor = module[dep.className];

                if (ClassConstructor) {
                    container.register(dep.className, ClassConstructor);
                }
            } catch (error) {
                console.warn(`Failed to register ${dep.className}:`, error);
            }
        }
    }

    private static async generateCacheKey(baseDir: string): Promise<string> {
        const stats = await fs.stat(baseDir);
        return `${baseDir}-${stats.mtime.getTime()}`;
    }

    private static resolvePath(filePath: string): string {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }

        return path.resolve(process.cwd(), filePath);
    }
}