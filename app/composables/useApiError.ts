export const useApiError = () => {
  const toast = useToast();

  const show = (msg: string) => {
    toast.add({
      title: "Ocorreu um erro",
      description: msg,
      color: "error",
      icon: "i-lucide-circle-alert",
      duration: 5000,
    });
  };

  return { show };
};
