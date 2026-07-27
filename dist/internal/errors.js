export class FileExistsError extends Error {
    constructor() {
        super('File already exists (use --force to overwrite)');
        this.name = 'FileExistsError';
    }
}
//# sourceMappingURL=errors.js.map