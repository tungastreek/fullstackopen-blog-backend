class CustomError extends Error {
  constructor(message, name) {
    super(message);
    this.name = name;
  }
}

module.exports = CustomError;
