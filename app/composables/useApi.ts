/**
 * Composable que centraliza as chamadas HTTP à API do anin-pet.
 * Lê o token diretamente do cookie para garantir que esteja disponível
 * mesmo dentro de ações assíncronas de stores Pinia.
 */
export const useApi = () => {
  const config = useRuntimeConfig();
  const token = useCookie<string | null>("auth_token");

  const apiFetch = <T>(
    url: string,
    options?: Parameters<typeof $fetch>[1],
  ): Promise<T> => {
    return $fetch<T>(`${config.public.apiUrl}${url}`, {
      ...options,
      headers: {
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        ...(options?.headers as Record<string, string> | undefined),
      },
    });
  };

  return { apiFetch };
};
