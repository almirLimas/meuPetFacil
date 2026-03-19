const message = ref<string | null>(null);

export const useApiError = () => {
  const show = (msg: string) => {
    message.value = msg;
  };

  const clear = () => {
    message.value = null;
  };

  return { message: readonly(message), show, clear };
};
