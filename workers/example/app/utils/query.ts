export async function query(url: string): Promise<Response> {
  const cache = await caches.open("api-cache");

  let response = await cache.match(url);
  if (!response) {
    response = await fetch(url);
    const responseBody = await response.clone().arrayBuffer();
    const cachedResponse = new Response(responseBody, {
      headers: {
        "Cache-Control": "max-age=3600",
      },
    });
    await cache.put(url, cachedResponse);
  }

  return response;
}
