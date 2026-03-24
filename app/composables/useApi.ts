/**
 * Composable que centraliza as chamadas HTTP à API do anin-pet.
 * DEVE ser chamado no nível do setup (componente ou store), nunca dentro
 * de funções assíncronas, para garantir que o contexto Nuxt esteja disponível.
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
