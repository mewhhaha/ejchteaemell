
import * as document from "./document.tsx";
import { type route } from "@mewhhaha/fx-router";
import * as $account from "./routes/account.tsx";
import * as $cart from "./routes/cart.tsx";
import * as $products from "./routes/products.tsx";
import * as $test from "./routes/test.tsx";
import * as $_index from "./routes/_index.tsx";
const $$account = { id: "account", mod: $account };
const $$cart = { id: "cart", mod: $cart };
const $$products = { id: "products", mod: $products };
const $$test = { id: "test", mod: $test };
const $$_index = { id: "_index", mod: $_index };
const $document = { id: "", mod: document };

export const routes: route[] = [[new URLPattern({ pathname: "/account" }), [$document,$$account]],
[new URLPattern({ pathname: "/cart" }), [$document,$$cart]],
[new URLPattern({ pathname: "/products" }), [$document,$$products]],
[new URLPattern({ pathname: "/test" }), [$document,$$test]],
[new URLPattern({ pathname: "/" }), [$document,$$_index]]];
