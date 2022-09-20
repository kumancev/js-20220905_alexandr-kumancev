export default class NotificationMessage {
  static activeNote;

  element;

  constructor(message = "", { duration = 0, type = "error" } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
  }

  show(parent = document.body) {
    if (NotificationMessage.activeNote) {
      NotificationMessage.activeNote.remove();
    }

    parent.append(this.element);

    setTimeout(() => {
      this.destroy();
    }, this.duration);

    NotificationMessage.activeNote = this;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.duration = 0;
  }

  // <div class="notification success" style="--value:20s">
  //   <div class="timer"></div>
  //   <div class="inner-wrapper">
  //     <div class="notification-header">success</div>
  //     <div class="notification-body">
  //       Hello world
  //     </div>
  //   </div>
  // </div>
}
