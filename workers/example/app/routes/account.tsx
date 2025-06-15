import { Suspense } from "@mewhhaha/fx-router/components";

export default function Route() {
  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header class="bg-white shadow-lg border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <a
                href="/"
                class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                ModernStore
              </a>
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
              <a href="/account" class="text-blue-600 font-medium">
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
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">My Account</h1>
          <p class="text-slate-600">
            Manage your profile, orders, and preferences
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <div class="text-center mb-6">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  alt="Profile"
                  class="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h2 class="text-xl font-semibold text-slate-900">John Doe</h2>
                <p class="text-slate-600">john.doe@example.com</p>
              </div>

              <nav class="space-y-2">
                <a
                  href="#profile"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg text-blue-600 bg-blue-50 font-medium"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profile</span>
                </a>
                <a
                  href="#orders"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
                    />
                  </svg>
                  <span>Orders</span>
                </a>
                <a
                  href="#addresses"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Addresses</span>
                </a>
                <a
                  href="#wishlist"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                >
                  <svg
                    class="w-5 h-5"
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
                  <span>Wishlist</span>
                </a>
                <a
                  href="#settings"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Settings</span>
                </a>
              </nav>
            </div>
          </div>

          <div class="lg:col-span-3">
            <div class="space-y-8">
              <section class="bg-white rounded-xl shadow-md p-6">
                <h2 class="text-xl font-semibold text-slate-900 mb-6">
                  Profile Information
                </h2>
                <form class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value="John"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value="Doe"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value="john.doe@example.com"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value="+1 (555) 123-4567"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value="1990-01-15"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div class="md:col-span-2 flex justify-end">
                    <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Save Changes
                    </button>
                  </div>
                </form>
              </section>

              <section class="bg-white rounded-xl shadow-md p-6">
                <h2 class="text-xl font-semibold text-slate-900 mb-6">
                  Recent Orders
                </h2>
                <Suspense
                  fallback={
                    <div class="space-y-4">
                      {[1, 2, 3].map(() => (
                        <div class="border border-slate-200 rounded-lg p-4 animate-pulse">
                          <div class="flex justify-between items-start mb-4">
                            <div>
                              <div class="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                              <div class="h-3 bg-slate-200 rounded w-24"></div>
                            </div>
                            <div class="h-6 bg-slate-200 rounded w-16"></div>
                          </div>
                          <div class="flex items-center space-x-4">
                            <div class="w-16 h-16 bg-slate-200 rounded-lg"></div>
                            <div class="flex-1">
                              <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                              <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                >
                  {async () => {
                    const cacheKey =
                      "https://fakestoreapi.com/products?limit=3";
                    const cache = await caches.open("api-cache");

                    let response = await cache.match(cacheKey);
                    if (!response) {
                      response = await fetch(cacheKey);
                      const clonedResponse = response.clone();
                      clonedResponse.headers.set(
                        "Cache-Control",
                        "max-age=3600",
                      );
                      await cache.put(cacheKey, clonedResponse);
                    }

                    const products = (await response.json()) as Array<{
                      id: number;
                      title: string;
                      price: number;
                      image: string;
                    }>;

                    const orders = products.map((product, index) => ({
                      id: `ORD-${1000 + index}`,
                      date: new Date(
                        Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString(),
                      status:
                        index === 0
                          ? "Delivered"
                          : index === 1
                            ? "Shipped"
                            : "Processing",
                      total: (product.price * (index + 1)).toFixed(2),
                      items: [product],
                    }));

                    return (
                      <div class="space-y-4">
                        {orders.map((order) => (
                          <div class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-4">
                              <div>
                                <h3 class="font-semibold text-slate-900">
                                  Order #{order.id}
                                </h3>
                                <p class="text-sm text-slate-600">
                                  {order.date}
                                </p>
                              </div>
                              <span
                                class={`px-3 py-1 rounded-full text-sm font-medium ${
                                  order.status === "Delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "Shipped"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            {order.items.map((item) => (
                              <div class="flex items-center space-x-4 mb-4">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  class="w-16 h-16 object-contain rounded-lg bg-slate-50 p-2"
                                />
                                <div class="flex-1">
                                  <h4 class="font-medium text-slate-900 line-clamp-1">
                                    {item.title}
                                  </h4>
                                  <p class="text-slate-600">${item.price}</p>
                                </div>
                              </div>
                            ))}
                            <div class="flex justify-between items-center pt-4 border-t border-slate-200">
                              <span class="font-semibold text-slate-900">
                                Total: ${order.total}
                              </span>
                              <div class="space-x-2">
                                <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                  View Details
                                </button>
                                <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                  Reorder
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div class="text-center">
                          <a
                            href="#"
                            class="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View All Orders
                          </a>
                        </div>
                      </div>
                    );
                  }}
                </Suspense>
              </section>

              <section class="bg-white rounded-xl shadow-md p-6">
                <h2 class="text-xl font-semibold text-slate-900 mb-6">
                  Account Security
                </h2>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-500"
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
                      <div>
                        <p class="font-medium text-slate-900">Password</p>
                        <p class="text-sm text-slate-600">
                          Last updated 3 months ago
                        </p>
                      </div>
                    </div>
                    <button class="text-blue-600 hover:text-blue-800 font-medium">
                      Change
                    </button>
                  </div>
                  <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-500"
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
                      <div>
                        <p class="font-medium text-slate-900">
                          Two-Factor Authentication
                        </p>
                        <p class="text-sm text-slate-600">Enabled via SMS</p>
                      </div>
                    </div>
                    <button class="text-blue-600 hover:text-blue-800 font-medium">
                      Manage
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
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
