import { Suspense } from "@mewhhaha/fx-router/components";

export default function Route() {
  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header class="bg-white shadow-lg border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ModernStore
              </h1>
            </div>
            <nav class="hidden md:flex space-x-8">
              <a
                href="/products"
                class="text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Products
              </a>
              <a
                href="/cart"
                class="text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Cart
              </a>
              <a
                href="/account"
                class="text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Account
              </a>
            </nav>
            <div class="flex items-center space-x-4">
              <button class="p-2 text-slate-600 hover:text-blue-600 transition-colors">
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button class="p-2 text-slate-600 hover:text-blue-600 transition-colors relative">
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h8a2 2 0 002-2v-8"
                  />
                </svg>
                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section class="mb-12">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-slate-900 mb-4">
              Featured Products
            </h2>
            <p class="text-slate-600 text-lg">
              Discover our handpicked selection of premium items
            </p>
          </div>

          <Suspense
            fallback={
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(() => (
                  <div class="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                    <div class="h-64 bg-slate-200"></div>
                    <div class="p-6">
                      <div class="h-4 bg-slate-200 rounded mb-2"></div>
                      <div class="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                      <div class="h-10 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            {async () => {
              const response = await fetch(
                "https://fakestoreapi.com/products?limit=6",
              );
              const productIds = (await response.json()) as Array<{
                id: number;
              }>;

              const ProductCard = ({ productId }: { productId: number }) => (
                <Suspense
                  fallback={
                    <div class="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                      <div class="h-64 bg-slate-200"></div>
                      <div class="p-6">
                        <div class="flex items-center justify-between mb-2">
                          <div class="h-6 bg-slate-200 rounded-full w-20"></div>
                          <div class="h-4 bg-slate-200 rounded w-16"></div>
                        </div>
                        <div class="h-5 bg-slate-200 rounded mb-2"></div>
                        <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div class="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div class="flex items-center justify-between">
                          <div class="h-8 bg-slate-200 rounded w-20"></div>
                          <div class="h-10 bg-slate-200 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                  }
                >
                  {async () => {
                    await new Promise((resolve) =>
                      setTimeout(resolve, Math.random() * 4000 + 2000),
                    );
                    const response = await fetch(
                      `https://fakestoreapi.com/products/${productId}`,
                    );
                    const product = (await response.json()) as {
                      id: number;
                      title: string;
                      price: number;
                      description: string;
                      category: string;
                      image: string;
                      rating: { rate: number; count: number };
                    };

                    return (
                      <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                        <div class="relative h-64 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.title}
                            class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div class="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                              class="w-5 h-5 text-slate-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div class="p-6">
                          <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                              {product.category}
                            </span>
                            <div class="flex items-center text-sm text-slate-500">
                              <svg
                                class="w-4 h-4 text-yellow-400 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {product.rating.rate} ({product.rating.count})
                            </div>
                          </div>
                          <h3 class="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                            {product.title}
                          </h3>
                          <p class="text-slate-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          <div class="flex items-center justify-between">
                            <span class="text-2xl font-bold text-slate-900">
                              ${product.price}
                            </span>
                            <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                              <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h8a2 2 0 002-2v-8"
                                />
                              </svg>
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </Suspense>
              );

              return (
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productIds.map((product) => (
                    <ProductCard productId={product.id} />
                  ))}
                </div>
              );
            }}
          </Suspense>
        </section>

        <section class="mb-12">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-slate-900 mb-4">
              Customer Reviews
            </h2>
            <p class="text-slate-600 text-lg">What our customers are saying</p>
          </div>

          <Suspense
            fallback={
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(() => (
                  <div class="bg-white rounded-xl shadow-md p-6 animate-pulse">
                    <div class="flex items-center mb-4">
                      <div class="w-12 h-12 bg-slate-200 rounded-full mr-4"></div>
                      <div>
                        <div class="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                        <div class="h-3 bg-slate-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div class="h-4 bg-slate-200 rounded mb-2"></div>
                    <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            }
          >
            {async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000));

              const reviews = [
                {
                  id: 1,
                  name: "Sarah Johnson",
                  email: "sarah.johnson@example.com",
                  body: "Amazing quality products! Fast shipping and excellent customer service. I've been shopping here for over a year and never been disappointed.",
                  avatar:
                    "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
                },
                {
                  id: 2,
                  name: "Michael Chen",
                  email: "m.chen@example.com",
                  body: "The product selection is fantastic and the prices are very competitive. The website is easy to navigate and checkout process is smooth.",
                  avatar:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
                },
              ];

              return (
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((review) => (
                    <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div class="flex items-center mb-4">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          class="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div>
                          <h4 class="font-semibold text-slate-900">
                            {review.name}
                          </h4>
                          <div class="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(() => (
                              <svg
                                class="w-4 h-4 fill-current"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p class="text-slate-600 leading-relaxed">
                        {review.body}
                      </p>
                    </div>
                  ))}
                </div>
              );
            }}
          </Suspense>
        </section>

        <section class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-4">Why Choose ModernStore?</h2>
            <p class="text-blue-100 text-lg mb-8">
              Experience the future of online shopping
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">
                Lightning Fast Delivery
              </h3>
              <p class="text-blue-100">
                Get your orders delivered within 24 hours with our express
                shipping service.
              </p>
            </div>

            <div class="text-center">
              <div class="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Premium Quality</h3>
              <p class="text-blue-100">
                Every product is carefully curated and tested to ensure the
                highest quality standards.
              </p>
            </div>

            <div class="text-center">
              <div class="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">24/7 Support</h3>
              <p class="text-blue-100">
                Our dedicated customer service team is always ready to help you
                with any questions.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer class="bg-slate-900 text-white mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 class="text-xl font-bold mb-4">ModernStore</h3>
              <p class="text-slate-400">
                Your premier destination for quality products and exceptional
                service.
              </p>
            </div>
            <div>
              <h4 class="font-semibold mb-4">Quick Links</h4>
              <ul class="space-y-2 text-slate-400">
                <li>
                  <a
                    href="/products"
                    class="hover:text-white transition-colors"
                  >
                    All Products
                  </a>
                </li>
                <li>
                  <a
                    href="/categories"
                    class="hover:text-white transition-colors"
                  >
                    Categories
                  </a>
                </li>
                <li>
                  <a href="/deals" class="hover:text-white transition-colors">
                    Special Deals
                  </a>
                </li>
                <li>
                  <a href="/new" class="hover:text-white transition-colors">
                    New Arrivals
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold mb-4">Customer Care</h4>
              <ul class="space-y-2 text-slate-400">
                <li>
                  <a href="/contact" class="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping"
                    class="hover:text-white transition-colors"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="/returns" class="hover:text-white transition-colors">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="/faq" class="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold mb-4">Follow Us</h4>
              <div class="flex space-x-4">
                <a
                  href="#"
                  class="text-slate-400 hover:text-white transition-colors"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  class="text-slate-400 hover:text-white transition-colors"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a
                  href="#"
                  class="text-slate-400 hover:text-white transition-colors"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.751-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ModernStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
