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
  const templateId = crypto.randomUUID();
  const scriptId = crypto.randomUUID();

  const nonceAttribute = nonce ? ` nonce="${nonce}"` : "";

  return into(
    (async function* () {
      while (suspended.size > 0) {
        const [id, element] = await Promise.race(suspended.values());
        suspended.delete(id);
        yield* `<template id="${templateId}">${element}</template>`;
        yield* `
<script id="${scriptId}" type="application/javascript"${nonceAttribute}>
(() => {
const template = document.getElementById("${templateId}");
const target = document.getElementById("${id}");
if (template) {
    target.replaceWith(template.content.cloneNode(true));
}

document.getElementById("${scriptId}").remove();
document.getElementById("${templateId}").remove();
})()

</script>`.trim();
      }
    })(),
  );
};
