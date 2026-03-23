export const useMask = () => {
  const maskCpf = (value: string): string => {
    const d = value.replaceAll(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  /**
   * Máscara inteligente que detecta telefone fixo (10 dígitos) ou celular (11 dígitos):
   *  Fixo:   (XX) XXXX-XXXX
   *  Celular: (XX) XXXXX-XXXX
   */
  const maskTelefone = (value: string): string => {
    const d = value.replaceAll(/\D/g, "").slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10)
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    // 11 dígitos → celular
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const isValidCpf = (value: string): boolean => {
    const d = value.replaceAll(/\D/g, "");
    if (d.length !== 11) return false;
    // Rejeita sequências conhecidas (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(d)) return false;

    const calc = (end: number): number => {
      let sum = 0;
      for (let i = 0; i < end; i++) sum += Number(d[i]) * (end + 1 - i);
      const rem = (sum * 10) % 11;
      return rem === 10 ? 0 : rem;
    };

    return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
  };

  return { maskCpf, maskTelefone, isValidCpf };
};
