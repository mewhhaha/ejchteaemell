
import * as document from "./document.tsx";
import { type route } from "@mewhhaha/fx-router";
import * as $_index from "./routes/_index.tsx";
const $$_index = { id: "_index", mod: $_index };
const $document = { id: "", mod: document };

export const routes: route[] = [[new URLPattern({ pathname: "/" }), [$document,$$_index]]];
