import ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from "dotenv";

dotenv.config();

const projectRoot = path.resolve(__dirname);
const sourceDir = path.join(projectRoot, 'src');
const outputFile = path.join(projectRoot, 'src', 'dependencies.ts');

const injectableClasses: string[] = [];

function scanDirectory(dir: string) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            scanDirectory(filePath);
            return;
        }
        if (file.endsWith('.ts')) {
            analyzeFile(filePath);
        }
    });
}

function analyzeFile(fileName: string) {
    const sourceFile = ts.createSourceFile(
        fileName,
        fs.readFileSync(fileName, 'utf8'),
        ts.ScriptTarget.ESNext,
        true
    );

    ts.forEachChild(sourceFile, (node) => {
        if (ts.isClassDeclaration(node) && ts.getDecorators(node)) {
            const hasInjectable = ts.getDecorators(node)?.some((decorator) => filterInjectable(decorator));

            if (hasInjectable && node.name) {
                const relativePath = './' + path.relative(sourceDir, fileName).replace(/\\/g, '/').replace(/\.ts$/, '');
                const className = node.name.text;

                injectableClasses.push(`import { ${className} } from '${relativePath}';`);
                injectableClasses.push(`${className};`);
            }
        }
    });
}

function filterInjectable(decorator: ts.Decorator) {
    if (ts.isCallExpression(decorator.expression)) {
        const expr = decorator.expression.expression;

        if (ts.isIdentifier(expr)) {
            return ['Injectable', 'Component', 'Controller', 'Service', 'Repository'].includes(expr.text);
        }
    }
    return false;
}

function moveToFront(arr: Array<string>, item: string) {
    return [...arr.filter(el => el.includes(item)), ...arr.filter(el => !el.includes(item))];
}

scanDirectory(sourceDir);

const fileContent = `
import { DIContainer } from '${process.env.DI_CONTAINER_PATH}';
DIContainer;
${moveToFront(injectableClasses, "Router").join('\n')}
`;

fs.writeFileSync(outputFile, fileContent);