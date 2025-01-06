export interface FileRepository {
    write(filename: string, file: Buffer): Promise<void>;
}