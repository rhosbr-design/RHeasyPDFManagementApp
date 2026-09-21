export type RoleId = 'admin' | 'rh' | 'gerencia' | 'supervisao';

export interface Permission {
  module: string;
  label: string;
  icon: string;
  admin: boolean | 'full' | 'read';
  rh: boolean | 'full' | 'read';
  gerencia: boolean | 'full' | 'read';
  supervisao: boolean | 'full' | 'read';
}

export interface SystemUser {
  id: string;
  nome: string;
  email: string;
  avatar: string;
  role: RoleId;
  departamento: string;
  status: 'ativo' | 'inativo' | 'bloqueado';
  ultimoAcesso: string;
  criadoEm: string;
  criadoPor: string;
  telefone: string;
  linkedEmployeeId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: RoleId;
  action: string;
  module: string;
  detail: string;
  ip: string;
  at: string;
  severity: 'info' | 'warning' | 'critical';
}

export const roles: Record<RoleId, { label: string; color: string; bg: string; border: string; icon: string; description: string }> = {
  admin: {
    label: 'Administrador',
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-300',
    icon: '🛡️',
    description: 'Acesso total ao sistema, incluindo gerenciamento de usuários, permissões e logs de auditoria.',
  },
  rh: {
    label: 'RH',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    icon: '👥',
    description: 'Gestão completa de colaboradores, documentos, admissões e canal de solicitações.',
  },
  gerencia: {
    label: 'Gerência',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    icon: '📈',
    description: 'Visualização de relatórios, aprovação de solicitações e acesso ao dashboard executivo.',
  },
  supervisao: {
    label: 'Supervisão',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    icon: '👁️',
    description: 'Acompanhamento de equipe, solicitações do setor e histórico de colaboradores.',
  },
};

export const permissions: Permission[] = [
  { module: 'dashboard',     label: 'Painel Principal',      icon: '📊', admin: 'full', rh: 'full',  gerencia: 'full', supervisao: 'read' },
  { module: 'upload',        label: 'Importar PDF',          icon: '📤', admin: 'full', rh: 'full',  gerencia: false,  supervisao: false },
  { module: 'signed',        label: 'Doc. Assinados',        icon: '✍️', admin: 'full', rh: 'full',  gerencia: 'read', supervisao: 'read' },
  { module: 'confirmations', label: 'Comprovantes',          icon: '🔐', admin: 'full', rh: 'full',  gerencia: 'read', supervisao: false },
  { module: 'employees',     label: 'Colaboradores',         icon: '👥', admin: 'full', rh: 'full',  gerencia: 'read', supervisao: 'read' },
  { module: 'admission',     label: 'Admissão',              icon: '📋', admin: 'full', rh: 'full',  gerencia: 'read', supervisao: false },
  { module: 'history',       label: 'Histórico de Envios',   icon: '📑', admin: 'full', rh: 'full',  gerencia: 'read', supervisao: 'read' },
  { module: 'requests',      label: 'Solicitações',          icon: '📬', admin: 'full', rh: 'full',  gerencia: 'full', supervisao: 'full' },
  { module: 'admin',         label: 'Administração',         icon: '⚙️', admin: 'full', rh: false,   gerencia: false,  supervisao: false },
];

export const systemUsers: SystemUser[] = [
  {
    id: 'u001', nome: 'Admin RH', email: 'admin@empresa.com.br', avatar: 'AR',
    role: 'admin', departamento: 'Tecnologia', status: 'ativo',
    ultimoAcesso: '2026-08-18T08:01:00', criadoEm: '2024-01-01T00:00:00', criadoPor: 'Sistema',
    telefone: '(11) 99000-0001',
  },
  {
    id: 'u002', nome: 'Fernanda Lima', email: 'fernanda.lima@empresa.com.br', avatar: 'FL',
    role: 'rh', departamento: 'Recursos Humanos', status: 'ativo',
    ultimoAcesso: '2026-08-18T07:55:00', criadoEm: '2024-03-10T09:00:00', criadoPor: 'Admin RH',
    telefone: '(11) 98100-2233', linkedEmployeeId: '001',
  },
  {
    id: 'u003', nome: 'Marcos Vieira', email: 'marcos.vieira@empresa.com.br', avatar: 'MV',
    role: 'rh', departamento: 'Recursos Humanos', status: 'ativo',
    ultimoAcesso: '2026-08-17T17:30:00', criadoEm: '2024-05-20T10:00:00', criadoPor: 'Admin RH',
    telefone: '(11) 98200-4455',
  },
  {
    id: 'u004', nome: 'Ricardo Barros', email: 'ricardo.barros@empresa.com.br', avatar: 'RB',
    role: 'gerencia', departamento: 'Diretoria', status: 'ativo',
    ultimoAcesso: '2026-08-18T06:48:00', criadoEm: '2024-02-15T11:00:00', criadoPor: 'Admin RH',
    telefone: '(11) 99300-6677',
  },
  {
    id: 'u005', nome: 'Patrícia Souza', email: 'patricia.souza@empresa.com.br', avatar: 'PS',
    role: 'gerencia', departamento: 'Financeiro', status: 'ativo',
    ultimoAcesso: '2026-08-17T16:10:00', criadoEm: '2024-04-01T09:00:00', criadoPor: 'Admin RH',
    telefone: '(11) 99400-8899',
  },
  {
    id: 'u006', nome: 'Leandro Costa', email: 'leandro.costa@empresa.com.br', avatar: 'LC',
    role: 'supervisao', departamento: 'Operações', status: 'ativo',
    ultimoAcesso: '2026-08-18T08:10:00', criadoEm: '2024-06-12T14:00:00', criadoPor: 'Fernanda Lima',
    telefone: '(31) 98500-1122',
  },
  {
    id: 'u007', nome: 'Tatiane Rocha', email: 'tatiane.rocha@empresa.com.br', avatar: 'TR',
    role: 'supervisao', departamento: 'Comercial', status: 'ativo',
    ultimoAcesso: '2026-08-16T12:45:00', criadoEm: '2024-07-08T10:00:00', criadoPor: 'Fernanda Lima',
    telefone: '(21) 98600-3344',
  },
  {
    id: 'u008', nome: 'Gustavo Mendes', email: 'gustavo.mendes@empresa.com.br', avatar: 'GM',
    role: 'supervisao', departamento: 'TI', status: 'inativo',
    ultimoAcesso: '2026-07-30T09:00:00', criadoEm: '2024-08-01T11:00:00', criadoPor: 'Admin RH',
    telefone: '(41) 98700-5566',
  },
];

export const auditLogs: AuditLog[] = [
  { id: 'al001', userId: 'u001', userName: 'Admin RH', role: 'admin', action: 'Login', module: 'Sistema', detail: 'Acesso ao sistema via credenciais', ip: '192.168.1.105', at: '2026-08-18T08:01:00', severity: 'info' },
  { id: 'al002', userId: 'u002', userName: 'Fernanda Lima', role: 'rh', action: 'Envio em massa', module: 'PDF', detail: 'Holerites de julho/2026 enviados — 7 colaboradores', ip: '192.168.1.110', at: '2026-08-01T09:35:00', severity: 'info' },
  { id: 'al003', userId: 'u001', userName: 'Admin RH', role: 'admin', action: 'Usuário criado', module: 'Admin', detail: 'Novo usuário Leandro Costa (Supervisão)', ip: '192.168.1.105', at: '2026-08-15T14:00:00', severity: 'info' },
  { id: 'al004', userId: 'u003', userName: 'Marcos Vieira', role: 'rh', action: 'Envio falhou', module: 'PDF', detail: 'Holerite de Fernando Nascimento — e-mail inválido', ip: '192.168.1.112', at: '2026-07-01T10:15:00', severity: 'warning' },
  { id: 'al005', userId: 'u004', userName: 'Ricardo Barros', role: 'gerencia', action: 'Login', module: 'Sistema', detail: 'Acesso ao painel gerencial', ip: '10.0.0.50', at: '2026-08-18T06:48:00', severity: 'info' },
  { id: 'al006', userId: 'u001', userName: 'Admin RH', role: 'admin', action: 'Permissão alterada', module: 'Admin', detail: 'Perfil de Gustavo Mendes alterado para inativo', ip: '192.168.1.105', at: '2026-08-10T11:00:00', severity: 'warning' },
  { id: 'al007', userId: 'u002', userName: 'Fernanda Lima', role: 'rh', action: 'Admissão concluída', module: 'Admissão', detail: 'Lucas Henrique Tavares admitido — MAT-2309', ip: '192.168.1.110', at: '2026-08-12T15:00:00', severity: 'info' },
  { id: 'al008', userId: 'u006', userName: 'Leandro Costa', role: 'supervisao', action: 'Solicitação criada', module: 'Solicitações', detail: 'Correção de ponto — Carlos Lima — 05/08', ip: '10.0.0.80', at: '2026-08-12T09:15:00', severity: 'info' },
  { id: 'al009', userId: 'u001', userName: 'Admin RH', role: 'admin', action: 'Tentativa de acesso negada', module: 'Admin', detail: '3 tentativas de login incorretas — IP bloqueado', ip: '203.45.67.89', at: '2026-08-13T03:22:00', severity: 'critical' },
  { id: 'al010', userId: 'u005', userName: 'Patrícia Souza', role: 'gerencia', action: 'Relatório exportado', module: 'Histórico', detail: 'CSV de envios — agosto/2026', ip: '10.0.0.55', at: '2026-08-17T16:10:00', severity: 'info' },
];
