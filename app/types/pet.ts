export type PetEspecie = "Cão" | "Gato" | "Coelho" | "Ave" | "Réptil" | "Outro";
export type PetTamanho = "Pequeno" | "Médio" | "Grande" | "Gigante";

export const PET_ESPECIES: PetEspecie[] = [
  "Cão",
  "Gato",
  "Coelho",
  "Ave",
  "Réptil",
  "Outro",
];

export const PET_TAMANHOS: { label: string; value: PetTamanho }[] = [
  { label: "Pequeno (até 10 kg)", value: "Pequeno" },
  { label: "Médio (10–25 kg)", value: "Médio" },
  { label: "Grande (25–45 kg)", value: "Grande" },
  { label: "Gigante (+45 kg)", value: "Gigante" },
];

export interface PetFormState {
  nome: string;
  raca: string;
  especie?: PetEspecie;
  tamanho?: PetTamanho;
  idade: string;
  peso: string;
  observacoes: string;
}

export interface Pet extends PetFormState {
  id: string;
  clienteId: string;
  createdAt: string;
}
