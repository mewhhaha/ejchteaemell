import { jsx } from "./runtime/jsx-runtime.mts";
import type { JSX } from "./runtime/jsx.mts";
import { into, type Html } from "./runtime/node.mts";

const suspended = new Map<string, Promise<[id: string, html: string]>>();

export const Suspense = ({
  fallback,
  children,
}: {
  fallback: JSX.Element;
  children: JSX.Element | (() => Promise<JSX.Element>);
}): Html => {
  const id = `suspense-${crypto.randomUUID()}`;
  suspended.set(
    id,
    typeof children === "function"
      ? children().then(async (el) => [id, await (await el).toPromise()])
      : (async () => [id, await (await children).toPromise()])(),
  );
  return jsx("div", {
    id,
    children: fallback,
  });
};

type ResolveProps = {
  nonce?: string;
};

export const Resolve = ({ nonce }: ResolveProps): JSX.Element => {
  return into(
    (async function* () {
      const nonceAttribute = nonce ? ` nonce="${nonce}"` : "";
      yield* `
<script type="application/javascript"${nonceAttribute}>
window.__resolve = (templateId, targetId) => {
  const target = document.getElementById(targetId);
  const template = document.getElementById(templateId);
  if (template && target) {
    target.replaceWith(template.querySelector("template").content.cloneNode(true));
  }
  template?.remove();
};
</script>
`;

      while (suspended.size > 0) {
        const templateId = crypto.randomUUID();
        const [id, element] = await Promise.race(suspended.values());
        suspended.delete(id);
        yield* `
<resolved-data id="${templateId}">
<template>${element}</template>
<script type="application/javascript"${nonceAttribute}>
    window.__resolve("${templateId}", "${id}");
</script>
</resolved-data>`;
      }
    })(),
  );
};
