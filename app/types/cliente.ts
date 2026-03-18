export interface ClienteFormState {
  nome: string;
  cpf: string;
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
  status: string;
}

export interface Cliente extends ClienteFormState {
  id: string;
  createdAt: string;
  updatedAt?: string;
}
