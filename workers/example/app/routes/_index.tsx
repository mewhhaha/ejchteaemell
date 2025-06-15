import { Suspense } from "@mewhhaha/fx-router/components";

export default function Route() {
  return (
    <div>
      <header>
        <h1>My Ecommerce Store</h1>
        <nav>
          <a href="/products">Products</a>
          <a href="/cart">Cart</a>
          <a href="/account">Account</a>
        </nav>
      </header>

      <main>
        <section>
          <h2>Featured Products</h2>
          <Suspense fallback={<div>Loading featured products...</div>}>
            {async () => {
              await new Promise((resolve) => setTimeout(resolve, 500));
              const response = await fetch(
                "https://jsonplaceholder.typicode.com/posts?_limit=3",
              );
              const products = (await response.json()) as Array<{
                id: number;
                title: string;
                body: string;
              }>;
              return (
                <div class="product-grid">
                  {products.map((product) => (
                    <div class="product-card">
                      <h3>{product.title}</h3>
                      <p>{product.body.substring(0, 100)}...</p>
                      <button>Add to Cart - $29.99</button>
                    </div>
                  ))}
                </div>
              );
            }}
          </Suspense>
        </section>

        <section>
          <h2>Customer Reviews</h2>
          <Suspense fallback={<div>Loading customer reviews...</div>}>
            {async () => {
              await new Promise((resolve) => setTimeout(resolve, 10000));
              const response = await fetch(
                "https://jsonplaceholder.typicode.com/comments?_limit=2",
              );
              const reviews = (await response.json()) as Array<{
                id: number;
                name: string;
                body: string;
              }>;
              return (
                <div class="reviews">
                  {reviews.map((review) => (
                    <div class="review">
                      <h4>{review.name}</h4>
                      <p>{review.body}</p>
                      <div>★★★★☆</div>
                    </div>
                  ))}
                </div>
              );
            }}
          </Suspense>
        </section>

        <section>
          <h2>Static Content</h2>
          <p>This loads immediately! No waiting for APIs.</p>
          <div>
            <h3>Why Shop With Us?</h3>
            <ul>
              <li>Fast shipping</li>
              <li>Quality products</li>
              <li>Great customer service</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
