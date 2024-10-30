export class NotFoundError extends Response {
  constructor(message = "Not found", statusText = "Not Found") {
    super(message, { status: 404, statusText });
  }
}
