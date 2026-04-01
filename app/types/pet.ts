export type PetEspecie = "Cão" | "Gato" | "Coelho" | "Ave" | "Réptil" | "Outro";
export type PetTamanho = "Pequeno" | "Médio" | "Grande" | "Gigante";
export type PetSexo = "Macho" | "Fêmea";

export const PET_ESPECIES: PetEspecie[] = [
  "Cão",
  "Gato",
  "Coelho",
  "Ave",
  "Réptil",
  "Outro",
];

export const PET_SEXOS: { label: string; value: PetSexo }[] = [
  { label: "Macho", value: "Macho" },
  { label: "Fêmea", value: "Fêmea" },
];

export const RACAS_POR_ESPECIE: Record<PetEspecie, string[]> = {
  Cão: [
    "SRD (Vira-lata)",
    "Labrador",
    "Golden Retriever",
    "Bulldog Francês",
    "Poodle",
    "Shih Tzu",
    "Yorkshire Terrier",
    "Beagle",
    "Dachshund (Salsicha)",
    "Lhasa Apso",
    "Maltês",
    "Pinscher",
    "Rottweiler",
    "Pastor Alemão",
    "Husky Siberiano",
    "Border Collie",
    "Boxer",
    "Bichon Frisé",
    "Cocker Spaniel",
    "Spitz Alemão (Lulu da Pomerânia)",
    "Outro",
  ],
  Gato: [
    "SRD (Vira-lata)",
    "Persa",
    "Siamês",
    "Maine Coon",
    "Ragdoll",
    "Bengala",
    "Angorá",
    "British Shorthair",
    "Sphynx",
    "Scottish Fold",
    "Outro",
  ],
  Coelho: ["SRD", "Angorá", "Holland Lop", "Mini Rex", "Rex", "Outro"],
  Ave: ["Calopsita", "Periquito", "Papagaio", "Canário", "Agapornis", "Outro"],
  Réptil: ["Iguana", "Gecko", "Tartaruga", "Jabuti", "Outro"],
  Outro: ["Outro"],
};

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
  sexo?: PetSexo;
  tamanho?: PetTamanho;
  dataNascimento: string;
  peso: string;
  observacoes: string;
}

export interface Pet extends PetFormState {
  id: string;
  clienteId: string;
  createdAt: string;
}
