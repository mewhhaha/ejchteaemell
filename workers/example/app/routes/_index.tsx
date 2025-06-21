export const loader = async () => {
  throw new Response(null, { headers: { Location: "/signals" }, status: 302 });
};
