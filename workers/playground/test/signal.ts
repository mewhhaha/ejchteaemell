export const useSignal = <T>(value: T) => {
  return {
    id: crypto.randomUUID(),
    value,
  };
};
