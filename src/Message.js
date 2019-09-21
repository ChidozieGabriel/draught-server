class Message {
  constructor({ action, data }) {
    this.action = action;
    this.data = data;
  }

  setData(data) {
    this.data = data;
    return this;
  }

  static fromJSON(json) {
    const message = JSON.parse(json);
    return new Message(message);
  }

  toJSON() {
    return JSON.stringify({ action: this.action, data: this.data });
  }
}

module.exports = Message;
