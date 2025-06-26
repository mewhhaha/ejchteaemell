class ClientHydrator {
  private stateMap = new Map<string, any>();
  private handlerMap = new Map<string, Function>();

  hydrate(): void {
    this.parseComments();
    this.bindHandlers();
  }

  private parseComments(): void {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false,
    );

    let comment;
    while ((comment = walker.nextNode())) {
      const content = comment.textContent?.trim();
      if (!content) continue;

      if (content.startsWith("fx:state:")) {
        this.parseStateComment(content);
      } else if (content.startsWith("fx:handler:")) {
        this.parseHandlerComment(content);
      }
    }
  }

  private parseStateComment(content: string): void {
    const parts = content.split(":");
    if (parts.length >= 3) {
      const id = parts[2];
      const dataStr = parts.slice(3).join(":");
      try {
        const data = JSON.parse(dataStr);
        this.stateMap.set(id, data);
      } catch (e) {
        console.error("Failed to parse state comment:", content);
      }
    }
  }

  private parseHandlerComment(content: string): void {
    const parts = content.split(":");
    if (parts.length >= 3) {
      const id = parts[2];
      const dataStr = parts.slice(3).join(":");
      try {
        const data = JSON.parse(dataStr);
        const fn = new Function("return " + data.fn)();
        this.handlerMap.set(id, fn);
      } catch (e) {
        console.error("Failed to parse handler comment:", content);
      }
    }
  }

  private bindHandlers(): void {
    const elements = document.querySelectorAll('[onclick*="fx.handle"]');
    elements.forEach((element) => {
      const onclick = element.getAttribute("onclick");
      if (onclick) {
        const match = onclick.match(/fx\.handle\(this,'([^']+)'\)/);
        if (match) {
          const handlerId = match[1];
          const handler = this.handlerMap.get(handlerId);
          if (handler) {
            element.addEventListener("click", handler.bind(element));
            element.removeAttribute("onclick");
          }
        }
      }
    });
  }

  handle(element: Element, handlerId: string): void {
    const handler = this.handlerMap.get(handlerId);
    if (handler) {
      handler.call(element);
    }
  }

  getState(id: string): any {
    return this.stateMap.get(id);
  }
}

const fx = new ClientHydrator();

if (typeof window !== "undefined") {
  (window as any).fx = fx;
  document.addEventListener("DOMContentLoaded", () => {
    fx.hydrate();
  });
}

export { fx };
