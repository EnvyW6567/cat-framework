import { HttpContentType } from '../type/HttpContentType';

export const HTTP_CONTENT_TYPE = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '': 'application/json',
    json: 'application/json',
} as const;

export const CONTENT_TYPE_PATH: Record<HttpContentType, string> = {
    'application/javascript': '',
    'application/json': '',
    'image/x-icon': '',
    'text/css': '',
    'text/html': '',
    'image/png': '/png',
    'image/jpeg': '/jpeg',
    'image/svg+xml': '/png',
    'application/pdf': '/pdf',
    'text/plain': '',
};