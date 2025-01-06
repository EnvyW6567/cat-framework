interface Repository<T> {
    mapToEntity(data: Array<any>): T | T[];
}