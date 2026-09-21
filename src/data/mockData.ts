export interface Employee {
  id: string;
  nomeCompleto: string;
  matricula: string;
  cpf: string;
  telefone: string;
  email: string;
  departamento: string;
  cargo: string;
  avatar: string;
  dataAdmissao?: string;
  status?: 'ativo' | 'inativo' | 'ferias';
}

export interface PDFPage {
  id: string;
  pageNumber: number;
  employeeId: string | null;
  employeeName: string | null;
  matricula: string | null;
  documentType: string;
  status: 'identificado' | 'nao_identificado' | 'enviado';
  sendMethod?: 'email' | 'whatsapp';
  sentAt?: string;
}

export interface HistoryEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  matricula: string;
  documentType: string;
  action: string;
  sendMethod: 'email' | 'whatsapp' | 'ambos';
  status: 'entregue' | 'pendente' | 'falhou';
  createdBy: string;
  createdAt: string;
  confirmationCode: string;
}

export interface SendConfirmation {
  id: string;
  employeeId: string;
  employeeName: string;
  matricula: string;
  cpf: string;
  documentType: string;
  sendMethod: 'email' | 'whatsapp' | 'ambos';
  recipientEmail?: string;
  recipientPhone?: string;
  sentAt: string;
  deliveredAt?: string;
  confirmationCode: string;
  ipAddress: string;
  sentBy: string;
  legalHash: string;
  status: 'entregue' | 'pendente' | 'falhou';
}

export type RequestType = 'ferias' | 'ponto' | 'alteracao_cadastral' | 'denuncia' | 'sugestao';
export type RequestStatus = 'aberta' | 'em_analise' | 'concluida' | 'rejeitada';

export interface SolicitacaoRequest {
  id: string;
  tipo: RequestType;
  employeeId: string;
  employeeName: string;
  matricula: string;
  departamento: string;
  titulo: string;
  descricao: string;
  status: RequestStatus;
  prioridade: 'baixa' | 'media' | 'alta';
  createdAt: string;
  updatedAt: string;
  resolvidoPor?: string;
  resposta?: string;
  anonimo?: boolean;
  // Férias specific
  dataInicioFerias?: string;
  dataFimFerias?: string;
  // Ponto specific
  dataPonto?: string;
  horarioEsperado?: string;
  // Alteração cadastral specific
  campoAlteracao?: string;
  valorAntigo?: string;
  valorNovo?: string;
}

export interface AdmissionDoc {
  id: string;
  tipo: 'rg' | 'cpf' | 'ctps' | 'comprovante_residencia' | 'titulo_eleitor' | 'reservista' | 'foto' | 'certidao_nascimento' | 'diploma';
  label: string;
  status: 'pendente' | 'lido' | 'validado';
  fileName?: string;
  extractedData?: Record<string, string>;
}

export interface Admission {
  id: string;
  status: 'rascunho' | 'documentos' | 'revisao' | 'concluida';
  createdAt: string;
  // Dados pessoais
  nomeCompleto: string;
  dataNascimento: string;
  cpf: string;
  rg: string;
  email: string;
  telefone: string;
  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  // Profissional
  cargo: string;
  departamento: string;
  salario: string;
  dataAdmissao: string;
  tipoContrato: string;
  // Bancário
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: string;
  // Documentos
  docs: AdmissionDoc[];
}

export interface SignedDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  matricula: string;
  documentType: string;
  documentTitle: string;
  signedAt: string;
  signatureMethod: 'assinatura_digital' | 'confirmacao_whatsapp' | 'aceite_email';
  legalHash: string;
  signedBy: string;
  ipAddress: string;
  status: 'valido' | 'revogado' | 'expirado';
  validUntil?: string;
  fileSize?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const employees: Employee[] = [
  { id: '001', nomeCompleto: 'Ana Paula Ferreira Santos', matricula: 'MAT-2301', cpf: '123.456.789-00', telefone: '(11) 98765-4321', email: 'ana.ferreira@empresa.com.br', departamento: 'Recursos Humanos', cargo: 'Analista de RH', avatar: 'AF', dataAdmissao: '2021-03-15', status: 'ativo' },
  { id: '002', nomeCompleto: 'Carlos Eduardo Lima Souza', matricula: 'MAT-2302', cpf: '234.567.890-11', telefone: '(11) 97654-3210', email: 'carlos.lima@empresa.com.br', departamento: 'Financeiro', cargo: 'Coordenador Financeiro', avatar: 'CL', dataAdmissao: '2020-07-01', status: 'ativo' },
  { id: '003', nomeCompleto: 'Mariana Oliveira Costa', matricula: 'MAT-2303', cpf: '345.678.901-22', telefone: '(21) 99876-5432', email: 'mariana.costa@empresa.com.br', departamento: 'TI', cargo: 'Desenvolvedora Sênior', avatar: 'MO', dataAdmissao: '2019-11-10', status: 'ferias' },
  { id: '004', nomeCompleto: 'Roberto Alves Pereira', matricula: 'MAT-2304', cpf: '456.789.012-33', telefone: '(21) 98765-1234', email: 'roberto.pereira@empresa.com.br', departamento: 'Comercial', cargo: 'Gerente Comercial', avatar: 'RP', dataAdmissao: '2018-04-22', status: 'ativo' },
  { id: '005', nomeCompleto: 'Juliana Martins Rodrigues', matricula: 'MAT-2305', cpf: '567.890.123-44', telefone: '(31) 99123-4567', email: 'juliana.rodrigues@empresa.com.br', departamento: 'Marketing', cargo: 'Supervisora de Marketing', avatar: 'JM', dataAdmissao: '2022-01-17', status: 'ativo' },
  { id: '006', nomeCompleto: 'Fernando Gomes Nascimento', matricula: 'MAT-2306', cpf: '678.901.234-55', telefone: '(31) 97890-6543', email: 'fernando.nascimento@empresa.com.br', departamento: 'Operações', cargo: 'Analista de Operações', avatar: 'FG', dataAdmissao: '2023-05-08', status: 'ativo' },
  { id: '007', nomeCompleto: 'Cristina Barbosa Mendes', matricula: 'MAT-2307', cpf: '789.012.345-66', telefone: '(41) 98901-2345', email: 'cristina.mendes@empresa.com.br', departamento: 'Jurídico', cargo: 'Advogada', avatar: 'CB', dataAdmissao: '2020-09-30', status: 'ativo' },
  { id: '008', nomeCompleto: 'Paulo Henrique Cardoso', matricula: 'MAT-2308', cpf: '890.123.456-77', telefone: '(41) 97012-3456', email: 'paulo.cardoso@empresa.com.br', departamento: 'Logística', cargo: 'Coordenador de Logística', avatar: 'PC', dataAdmissao: '2021-12-01', status: 'ativo' },
];

export const historyEntries: HistoryEntry[] = [
  { id: 'h001', employeeId: '001', employeeName: 'Ana Paula Ferreira Santos', matricula: 'MAT-2301', documentType: 'Holerite - Julho/2026', action: 'Documento enviado por e-mail', sendMethod: 'email', status: 'entregue', createdBy: 'Admin RH', createdAt: '2026-08-01T09:30:00', confirmationCode: 'RHE-2026-08-001-001' },
  { id: 'h002', employeeId: '002', employeeName: 'Carlos Eduardo Lima Souza', matricula: 'MAT-2302', documentType: 'Holerite - Julho/2026', action: 'Documento enviado via WhatsApp', sendMethod: 'whatsapp', status: 'entregue', createdBy: 'Admin RH', createdAt: '2026-08-01T09:31:00', confirmationCode: 'RHE-2026-08-002-001' },
  { id: 'h003', employeeId: '003', employeeName: 'Mariana Oliveira Costa', matricula: 'MAT-2303', documentType: 'Holerite - Julho/2026', action: 'Documento enviado por e-mail', sendMethod: 'email', status: 'entregue', createdBy: 'Admin RH', createdAt: '2026-08-01T09:32:00', confirmationCode: 'RHE-2026-08-003-001' },
  { id: 'h004', employeeId: '004', employeeName: 'Roberto Alves Pereira', matricula: 'MAT-2304', documentType: 'Holerite - Julho/2026', action: 'Documento enviado via WhatsApp', sendMethod: 'whatsapp', status: 'pendente', createdBy: 'Admin RH', createdAt: '2026-08-01T09:33:00', confirmationCode: 'RHE-2026-08-004-001' },
  { id: 'h005', employeeId: '005', employeeName: 'Juliana Martins Rodrigues', matricula: 'MAT-2305', documentType: 'Informe de Rendimentos 2025', action: 'Documento enviado por e-mail', sendMethod: 'email', status: 'entregue', createdBy: 'Fernanda Lima', createdAt: '2026-07-15T14:20:00', confirmationCode: 'RHE-2026-07-005-002' },
  { id: 'h006', employeeId: '001', employeeName: 'Ana Paula Ferreira Santos', matricula: 'MAT-2301', documentType: 'Contrato de Trabalho', action: 'Documento enviado por e-mail e WhatsApp', sendMethod: 'ambos', status: 'entregue', createdBy: 'Admin RH', createdAt: '2026-06-10T11:00:00', confirmationCode: 'RHE-2026-06-001-003' },
  { id: 'h007', employeeId: '006', employeeName: 'Fernando Gomes Nascimento', matricula: 'MAT-2306', documentType: 'Holerite - Junho/2026', action: 'Documento enviado por e-mail', sendMethod: 'email', status: 'falhou', createdBy: 'Marcos Vieira', createdAt: '2026-07-01T10:15:00', confirmationCode: 'RHE-2026-07-006-001' },
  { id: 'h008', employeeId: '007', employeeName: 'Cristina Barbosa Mendes', matricula: 'MAT-2307', documentType: 'Holerite - Julho/2026', action: 'Documento enviado via WhatsApp', sendMethod: 'whatsapp', status: 'entregue', createdBy: 'Admin RH', createdAt: '2026-08-01T09:35:00', confirmationCode: 'RHE-2026-08-007-001' },
];

export const sendConfirmations: SendConfirmation[] = [
  { id: 'sc001', employeeId: '001', employeeName: 'Ana Paula Ferreira Santos', matricula: 'MAT-2301', cpf: '123.456.789-00', documentType: 'Holerite - Julho/2026', sendMethod: 'email', recipientEmail: 'ana.ferreira@empresa.com.br', sentAt: '2026-08-01T09:30:00', deliveredAt: '2026-08-01T09:30:42', confirmationCode: 'RHE-2026-08-001-001', ipAddress: '192.168.1.105', sentBy: 'Admin RH', legalHash: 'sha256:a3f2c1d4e5b6a7f8e9d0c1b2a3f2c1d4', status: 'entregue' },
  { id: 'sc002', employeeId: '002', employeeName: 'Carlos Eduardo Lima Souza', matricula: 'MAT-2302', cpf: '234.567.890-11', documentType: 'Holerite - Julho/2026', sendMethod: 'whatsapp', recipientPhone: '(11) 97654-3210', sentAt: '2026-08-01T09:31:00', deliveredAt: '2026-08-01T09:31:18', confirmationCode: 'RHE-2026-08-002-001', ipAddress: '192.168.1.105', sentBy: 'Admin RH', legalHash: 'sha256:b4g3d2e5f6c7d8g9f0e1d2c3b4g3d2e5', status: 'entregue' },
  { id: 'sc003', employeeId: '003', employeeName: 'Mariana Oliveira Costa', matricula: 'MAT-2303', cpf: '345.678.901-22', documentType: 'Holerite - Julho/2026', sendMethod: 'email', recipientEmail: 'mariana.costa@empresa.com.br', sentAt: '2026-08-01T09:32:00', deliveredAt: '2026-08-01T09:32:55', confirmationCode: 'RHE-2026-08-003-001', ipAddress: '192.168.1.105', sentBy: 'Admin RH', legalHash: 'sha256:c5h4e3f6g7d8e9h0g1f2e3d4c5h4e3f6', status: 'entregue' },
  { id: 'sc004', employeeId: '004', employeeName: 'Roberto Alves Pereira', matricula: 'MAT-2304', cpf: '456.789.012-33', documentType: 'Holerite - Julho/2026', sendMethod: 'whatsapp', recipientPhone: '(21) 98765-1234', sentAt: '2026-08-01T09:33:00', confirmationCode: 'RHE-2026-08-004-001', ipAddress: '192.168.1.105', sentBy: 'Admin RH', legalHash: 'sha256:d6i5f4g7h8e9f0i1h2g3f4e5d6i5f4g7', status: 'pendente' },
];

export const mockPDFPages: PDFPage[] = [
  { id: 'p001', pageNumber: 1, employeeId: '001', employeeName: 'Ana Paula Ferreira Santos', matricula: 'MAT-2301', documentType: 'Holerite', status: 'identificado' },
  { id: 'p002', pageNumber: 2, employeeId: '002', employeeName: 'Carlos Eduardo Lima Souza', matricula: 'MAT-2302', documentType: 'Holerite', status: 'identificado' },
  { id: 'p003', pageNumber: 3, employeeId: '003', employeeName: 'Mariana Oliveira Costa', matricula: 'MAT-2303', documentType: 'Holerite', status: 'identificado' },
  { id: 'p004', pageNumber: 4, employeeId: null, employeeName: null, matricula: null, documentType: 'Holerite', status: 'nao_identificado' },
];

export const solicitacoes: SolicitacaoRequest[] = [
  { id: 'sol001', tipo: 'ferias', employeeId: '003', employeeName: 'Mariana Oliveira Costa', matricula: 'MAT-2303', departamento: 'TI', titulo: 'Solicitação de férias — agosto/2026', descricao: 'Solicito férias no período conforme saldo disponível.', status: 'em_analise', prioridade: 'media', createdAt: '2026-08-10T08:00:00', updatedAt: '2026-08-11T10:00:00', dataInicioFerias: '2026-08-18', dataFimFerias: '2026-09-01' },
  { id: 'sol002', tipo: 'ponto', employeeId: '002', employeeName: 'Carlos Eduardo Lima Souza', matricula: 'MAT-2302', departamento: 'Financeiro', titulo: 'Correção de ponto — 05/08/2026', descricao: 'Esqueci de registrar a entrada às 08h30. Solicito correção.', status: 'aberta', prioridade: 'alta', createdAt: '2026-08-12T09:15:00', updatedAt: '2026-08-12T09:15:00', dataPonto: '2026-08-05', horarioEsperado: '08:30' },
  { id: 'sol003', tipo: 'alteracao_cadastral', employeeId: '005', employeeName: 'Juliana Martins Rodrigues', matricula: 'MAT-2305', departamento: 'Marketing', titulo: 'Atualização de endereço', descricao: 'Mudei de endereço e preciso atualizar no sistema.', status: 'concluida', prioridade: 'baixa', createdAt: '2026-08-05T11:00:00', updatedAt: '2026-08-06T14:30:00', resolvidoPor: 'Admin RH', resposta: 'Endereço atualizado com sucesso.', campoAlteracao: 'Endereço', valorAntigo: 'Rua A, 100', valorNovo: 'Rua B, 250' },
  { id: 'sol004', tipo: 'denuncia', employeeId: '006', employeeName: 'Anônimo', matricula: '—', departamento: 'Operações', titulo: 'Relato de conduta inadequada', descricao: 'Relato situação de assédio moral ocorrida no setor de operações.', status: 'em_analise', prioridade: 'alta', createdAt: '2026-08-09T16:00:00', updatedAt: '2026-08-10T09:00:00', anonimo: true },
  { id: 'sol005', tipo: 'sugestao', employeeId: '004', employeeName: 'Roberto Alves Pereira', matricula: 'MAT-2304', departamento: 'Comercial', titulo: 'Sugestão: programa de bem-estar', descricao: 'Proposta de criar um programa de saúde mental para colaboradores.', status: 'aberta', prioridade: 'baixa', createdAt: '2026-08-13T10:00:00', updatedAt: '2026-08-13T10:00:00' },
  { id: 'sol006', tipo: 'ferias', employeeId: '001', employeeName: 'Ana Paula Ferreira Santos', matricula: 'MAT-2301', departamento: 'RH', titulo: 'Férias — dezembro/2026', descricao: 'Solicito período de férias para as festas de fim de ano.', status: 'aberta', prioridade: 'baixa', createdAt: '2026-08-14T08:30:00', updatedAt: '2026-08-14T08:30:00', dataInicioFerias: '2026-12-22', dataFimFerias: '2027-01-10' },
];

export const signedDocuments: SignedDocument[] = [
  { id: 'sd001', employeeId: '001', employeeName: 'Ana Paula Ferreira Santos', matricula: 'MAT-2301', documentType: 'Contrato', documentTitle: 'Contrato de Trabalho CLT', signedAt: '2021-03-15T14:00:00', signatureMethod: 'assinatura_digital', legalHash: 'sha256:e7j6g5h8i9f0j1i2h3g4f5e7j6g5h8i9', signedBy: 'Ana Paula Ferreira Santos', ipAddress: '177.83.22.114', status: 'valido', validUntil: undefined, fileSize: '245 KB' },
  { id: 'sd002', employeeId: '001', employeeName: 'Ana Paula Ferreira Santos', matricula: 'MAT-2301', documentType: 'Termo', documentTitle: 'Termo de Confidencialidade', signedAt: '2021-03-15T14:20:00', signatureMethod: 'assinatura_digital', legalHash: 'sha256:f8k7h6i9j0g1k2j3i4h5g6f8k7h6i9j0', signedBy: 'Ana Paula Ferreira Santos', ipAddress: '177.83.22.114', status: 'valido', fileSize: '112 KB' },
  { id: 'sd003', employeeId: '001', employeeName: 'Ana Paula Ferreira Santos', matricula: 'MAT-2301', documentType: 'Holerite', documentTitle: 'Holerite Julho/2026', signedAt: '2026-08-01T09:45:00', signatureMethod: 'confirmacao_whatsapp', legalHash: 'sha256:g9l8i7j0k1h2l3k4j5i6h7g9l8i7j0k1', signedBy: 'Ana Paula Ferreira Santos', ipAddress: '189.40.11.220', status: 'valido', fileSize: '89 KB' },
  { id: 'sd004', employeeId: '002', employeeName: 'Carlos Eduardo Lima Souza', matricula: 'MAT-2302', documentType: 'Contrato', documentTitle: 'Contrato de Trabalho CLT', signedAt: '2020-07-01T10:00:00', signatureMethod: 'assinatura_digital', legalHash: 'sha256:h0m9j8k1l2i3m4l5k6j7i8h0m9j8k1l2', signedBy: 'Carlos Eduardo Lima Souza', ipAddress: '200.143.66.78', status: 'valido', fileSize: '251 KB' },
  { id: 'sd005', employeeId: '002', employeeName: 'Carlos Eduardo Lima Souza', matricula: 'MAT-2302', documentType: 'Holerite', documentTitle: 'Holerite Julho/2026', signedAt: '2026-08-01T09:48:00', signatureMethod: 'confirmacao_whatsapp', legalHash: 'sha256:i1n0k9l2m3j4n5m6l7k8j9i1n0k9l2m3', signedBy: 'Carlos Eduardo Lima Souza', ipAddress: '200.143.66.78', status: 'valido', fileSize: '91 KB' },
  { id: 'sd006', employeeId: '003', employeeName: 'Mariana Oliveira Costa', matricula: 'MAT-2303', documentType: 'Contrato', documentTitle: 'Aditivo Contratual — Promoção', signedAt: '2023-01-10T15:30:00', signatureMethod: 'assinatura_digital', legalHash: 'sha256:j2o1l0m3n4k5o6n7m8l9k0j2o1l0m3n4', signedBy: 'Mariana Oliveira Costa', ipAddress: '186.215.44.92', status: 'valido', fileSize: '133 KB' },
  { id: 'sd007', employeeId: '004', employeeName: 'Roberto Alves Pereira', matricula: 'MAT-2304', documentType: 'Termo', documentTitle: 'Política de Uso de TI', signedAt: '2024-02-20T11:00:00', signatureMethod: 'aceite_email', legalHash: 'sha256:k3p2m1n4o5l6p7o8n9m0l1k3p2m1n4o5', signedBy: 'Roberto Alves Pereira', ipAddress: '177.83.100.15', status: 'valido', fileSize: '78 KB' },
  { id: 'sd008', employeeId: '005', employeeName: 'Juliana Martins Rodrigues', matricula: 'MAT-2305', documentType: 'Contrato', documentTitle: 'Contrato de Trabalho CLT', signedAt: '2022-01-17T09:00:00', signatureMethod: 'assinatura_digital', legalHash: 'sha256:l4q3n2o5p6m7q8p9o0n1m2l4q3n2o5p6', signedBy: 'Juliana Martins Rodrigues', ipAddress: '201.56.77.33', status: 'valido', fileSize: '238 KB' },
];
