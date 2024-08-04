class ApiError extends Error {
    constructor(message, statusCode, data, location, stack) {
        super(message);
        this.status = `${statusCode}`.startsWith(4) ? 'failed' : 'error';
        this.data = data;
        this.statusCode = statusCode;
        this.location = location;
        this.stack = stack;
    }
}

export { ApiError }