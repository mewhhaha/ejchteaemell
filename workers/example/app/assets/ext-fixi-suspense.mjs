customElements.define(
  "resolved-data",
  class extends HTMLElement {
    connectedCallback() {
      const target = document.getElementById(this.getAttribute("target"));
      const template = this.querySelector("template");
      if (template && target) {
        target.replaceWith(template.content.cloneNode(true));
      }
      this.remove();
    }
  },
);
