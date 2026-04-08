import type { Pet, PetFormState } from "./pet";

export interface ClienteFormState {
  nome: string;
  cpf?: string;
  telefonePrincipal: string;
  telefoneSecundario: string;
  email: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  dataNascimento: string;
  comoConheceu: string;
  observacoes: string;
  mensalista?: boolean;
  valorMensal?: number | null;
  diaVencimento?: number | null;
  status: string;
  pets: PetFormState[];
}

export interface Cliente extends Omit<ClienteFormState, "pets"> {
  id: string;
  codigo: number;
  createdAt: string;
  updatedAt?: string;
  ultimaMensalidadePaga?: string | null;
  pets: Pet[];
  _count?: { pets: number };
}
