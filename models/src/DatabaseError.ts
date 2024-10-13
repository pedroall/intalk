export class DatabaseError<R extends number> {
    constructor(public code: R) {}

    static error<R extends number>(code: R) {
        return new DatabaseError(code)
    }
}
