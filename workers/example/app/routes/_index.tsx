export const loader = async () => {
  throw new Response(null, { headers: { Location: "/products" }, status: 302 });
};
