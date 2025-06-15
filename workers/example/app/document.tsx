import { Resolve } from "@mewhhaha/fx-router/components";
import type { Route as t } from "./+types.document";

const fixiUrl = new URL("./assets/fixi.js", import.meta.url);
const extFixiUrl = new URL("./assets/ext-fixi.mjs", import.meta.url);

const stylesUrl = new URL("./assets/tailwind.css", import.meta.url);
const iconUrl = new URL("./assets/favicon.ico", import.meta.url);

export default function Document({ children }: t.ComponentProps) {
  return (
    <html lang="en">
      <head>
        <title>wawaweewa</title>
        <meta charset="UTF-8"></meta>
        <link rel="icon" type="image/svg" href={iconUrl.pathname}></link>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content"
        ></meta>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin=""
        />
        <link rel="stylesheet" href={stylesUrl.pathname} />
        <script src={fixiUrl.pathname}></script>
        <script type="module" src={extFixiUrl.pathname}></script>
      </head>
      <body>
        {children}
        <Resolve />
      </body>
    </html>
  );
}
