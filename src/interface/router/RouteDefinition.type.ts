export type RouteDefinition = {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    handlerName: string | symbol;
};
