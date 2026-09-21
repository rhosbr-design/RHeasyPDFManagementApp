import { useState } from 'react';
import {
  systemUsers as initialUsers, auditLogs, permissions, roles,
  type SystemUser, type RoleId, type AuditLog,
} from '../data/adminData';

type Tab = 'users' | 'roles' | 'permissions' | 'audit';

const statusCfg = {
  ativo:     { label: 'Ativo',      color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  inativo:   { label: 'Inativo',    color: 'text-gray-500',    bg: 'bg-gray-100',    dot: 'bg-gray-400' },
  bloqueado: { label: 'Bloqueado',  color: 'text-red-700',     bg: 'bg-red-100',     dot: 'bg-red-500' },
};

const severityCfg = {
  info:     { icon: 'ℹ️', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  warning:  { icon: '⚠️', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  critical: { icon: '🚨', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const fmtRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
};

const emptyUser: Omit<SystemUser, 'id' | 'criadoEm' | 'criadoPor' | 'ultimoAcesso'> = {
  nome: '', email: '', avatar: '', role: 'rh', departamento: '', status: 'ativo', telefone: '',
};

type PermValue = boolean | 'full' | 'read';

function PermIcon({ val }: { val: PermValue }) {
  if (val === 'full') return <span className="text-emerald-600 font-bold text-sm" title="Acesso total">✓ Total</span>;
  if (val === 'read') return <span className="text-blue-600 font-medium text-sm" title="Somente leitura">👁 Leitura</span>;
  return <span className="text-gray-300 text-sm">—</span>;
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<RoleId | ''>('');
  const [filterStatus, setFilterStatus] = useState<'ativo' | 'inativo' | 'bloqueado' | ''>('');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; user?: SystemUser } | null>(null);
  const [form, setForm] = useState(emptyUser);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [auditFilter, setAuditFilter] = useState<'info' | 'warning' | 'critical' | ''>('');
  const [auditSearch, setAuditSearch] = useState('');

  const upd = <K extends keyof typeof emptyUser>(k: K, v: (typeof emptyUser)[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(emptyUser); setModal({ mode: 'add' }); };
  const openEdit = (u: SystemUser) => {
    setForm({ nome: u.nome, email: u.email, avatar: u.avatar, role: u.role, departamento: u.departamento, status: u.status, telefone: u.telefone });
    setModal({ mode: 'edit', user: u });
  };

  const handleSave = () => {
    if (!form.nome || !form.email || !form.role) return;
    const avatar = form.avatar || form.nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
    if (modal?.mode === 'add') {
      const novo: SystemUser = {
        ...form, avatar, id: `u${Date.now()}`,
        criadoEm: new Date().toISOString(), criadoPor: 'Admin RH',
        ultimoAcesso: '—',
      };
      setUsers(p => [...p, novo]);
    } else if (modal?.mode === 'edit' && modal.user) {
      setUsers(p => p.map(u => u.id === modal.user!.id ? { ...u, ...form, avatar } : u));
    }
    setModal(null);
  };

  const handleToggleStatus = (id: string, status: SystemUser['status']) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, status } : u));
  };

  const handleDelete = (id: string) => {
    setUsers(p => p.filter(u => u.id !== id));
    setDeleteConfirm(null);
  };

  const filteredUsers = users.filter(u => {
    if (filterRole && u.role !== filterRole) return false;
    if (filterStatus && u.status !== filterStatus) return false;
    if (search && !u.nome.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredAudit = auditLogs.filter(l => {
    if (auditFilter && l.severity !== auditFilter) return false;
    if (auditSearch && !l.action.toLowerCase().includes(auditSearch.toLowerCase()) &&
        !l.userName.toLowerCase().includes(auditSearch.toLowerCase()) &&
        !l.detail.toLowerCase().includes(auditSearch.toLowerCase())) return false;
    return true;
  });

  const roleCounts = Object.fromEntries(
    (Object.keys(roles) as RoleId[]).map(r => [r, users.filter(u => u.role === r).length])
  ) as Record<RoleId, number>;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'users', label: 'Usuários do Sistema', icon: '👤' },
    { id: 'roles', label: 'Perfis de Acesso', icon: '🎭' },
    { id: 'permissions', label: 'Matriz de Permissões', icon: '🔑' },
    { id: 'audit', label: 'Log de Auditoria', icon: '📋' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Administração do Sistema</h1>
          <p className="text-sm text-gray-500 mt-1">Usuários · Perfis · Permissões · Auditoria</p>
        </div>
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
          <span>🛡️</span><span className="font-medium">Área Restrita — Administrador</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: USERS ── */}
      {tab === 'users' && (
        <div className="space-y-5">
          {/* Role summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(roles) as [RoleId, typeof roles[RoleId]][]).map(([rid, cfg]) => (
              <button key={rid} onClick={() => setFilterRole(filterRole === rid ? '' : rid)}
                className={`rounded-2xl p-4 border-2 text-left transition-all hover:shadow-md ${
                  filterRole === rid ? `${cfg.border} shadow-sm` : 'border-gray-100 bg-white'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.color} ${cfg.bg}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                  <span className="text-2xl font-bold text-navy-900">{roleCounts[rid]}</span>
                </div>
                <div className="text-xs text-gray-500 leading-relaxed line-clamp-2">{cfg.description}</div>
              </button>
            ))}
          </div>

          {/* Filters + Add */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input type="text" placeholder="Buscar por nome ou e-mail..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 bg-white shadow-sm" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm text-gray-700 focus:outline-none">
              <option value="">Todos os status</option>
              {Object.entries(statusCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button onClick={openAdd}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#0d1f4a,#2a4fa8)' }}>
              + Novo Usuário
            </button>
          </div>

          {/* User table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Usuário', 'Perfil', 'Departamento', 'Telefone', 'Último Acesso', 'Status', 'Ações'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map(u => {
                    const role = roles[u.role];
                    const st = statusCfg[u.status];
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#0d1f4a,#2a4fa8)' }}>{u.avatar}</div>
                            <div>
                              <div className="text-sm font-medium text-gray-800 whitespace-nowrap">{u.nome}</div>
                              <div className="text-xs text-blue-600">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${role.color} ${role.bg}`}>
                            {role.icon} {role.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{u.departamento}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{u.telefone}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {u.ultimoAcesso === '—' ? '—' : fmtRelative(u.ultimoAcesso)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${st.color} ${st.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(u)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-700 text-xs font-medium transition-colors">✏️ Editar</button>
                            {u.status === 'ativo'
                              ? <button onClick={() => handleToggleStatus(u.id, 'bloqueado')}
                                  className="px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-700 text-xs font-medium transition-colors">🔒</button>
                              : <button onClick={() => handleToggleStatus(u.id, 'ativo')}
                                  className="px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 text-xs font-medium transition-colors">🔓</button>
                            }
                            {u.id !== 'u001' && (
                              <button onClick={() => setDeleteConfirm(u.id)}
                                className="px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 text-xs transition-colors">🗑️</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">Nenhum usuário encontrado</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ROLES ── */}
      {tab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {(Object.entries(roles) as [RoleId, typeof roles[RoleId]][]).map(([rid, cfg]) => {
            const roleUsers = users.filter(u => u.role === rid);
            const rolePerms = permissions.filter(p => p[rid] !== false);
            const selected = selectedRole === rid;
            return (
              <div key={rid}
                className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${selected ? `${cfg.border} shadow-md` : 'border-gray-100'}`}>
                {/* Header */}
                <div className={`rounded-t-2xl px-6 py-5 ${cfg.bg}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`flex items-center gap-2 text-xl font-bold ${cfg.color}`}>
                        <span className="text-2xl">{cfg.icon}</span>
                        {cfg.label}
                      </div>
                      <p className="text-xs mt-1.5 text-gray-600 leading-relaxed">{cfg.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-extrabold ${cfg.color}`}>{roleCounts[rid]}</div>
                      <div className="text-xs text-gray-500">usuário(s)</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Permissions summary */}
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">Módulos com acesso:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {rolePerms.map(p => (
                        <span key={p.module} className={`text-xs px-2 py-1 rounded-lg font-medium ${p[rid] === 'full' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                          {p.icon} {p.label}
                          {p[rid] === 'read' && <span className="ml-1 opacity-60">(leitura)</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Users in this role */}
                  {roleUsers.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-2">Usuários neste perfil:</div>
                      <div className="flex flex-wrap gap-2">
                        {roleUsers.map(u => (
                          <div key={u.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                            <div className="w-5 h-5 rounded text-white text-xs font-bold flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg,#0d1f4a,#2a4fa8)', fontSize: '9px' }}>{u.avatar}</div>
                            <span className="text-xs text-gray-700">{u.nome.split(' ')[0]}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg[u.status].dot}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: PERMISSIONS ── */}
      {tab === 'permissions' && (
        <div className="space-y-4">
          <div className="bg-navy-50 border border-navy-200 rounded-xl p-3 text-sm text-navy-800 flex gap-2">
            <span>ℹ️</span>
            <span>A matriz define o que cada perfil pode ver e fazer em cada módulo do sistema.</span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg,#060f2a,#152a66)' }}>
                    <th className="text-left text-xs font-semibold text-white/70 px-6 py-4 w-56">Módulo</th>
                    {(Object.entries(roles) as [RoleId, typeof roles[RoleId]][]).map(([rid, cfg]) => (
                      <th key={rid} className="text-center text-xs font-semibold px-4 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {permissions.map((perm, i) => (
                    <tr key={perm.module} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-blue-50/30 transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{perm.icon}</span>
                          <span className="text-sm font-medium text-gray-800">{perm.label}</span>
                        </div>
                      </td>
                      {(['admin', 'rh', 'gerencia', 'supervisao'] as RoleId[]).map(rid => (
                        <td key={rid} className="px-4 py-4 text-center">
                          <PermIcon val={perm[rid]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-6 text-xs text-gray-500 bg-white rounded-xl border border-gray-100 px-5 py-3">
            <span className="font-semibold text-gray-600">Legenda:</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓ Total</span> — criar, editar, excluir e visualizar</span>
            <span className="flex items-center gap-1.5"><span className="text-blue-600">👁 Leitura</span> — somente visualizar</span>
            <span className="flex items-center gap-1.5"><span className="text-gray-300">—</span> — sem acesso</span>
          </div>
        </div>
      )}

      {/* ── TAB: AUDIT ── */}
      {tab === 'audit' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Eventos Totais', value: auditLogs.length, icon: '📋', color: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'Alertas', value: auditLogs.filter(l => l.severity === 'warning').length, icon: '⚠️', color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { label: 'Críticos', value: auditLogs.filter(l => l.severity === 'critical').length, icon: '🚨', color: 'bg-red-50 border-red-200 text-red-700' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{s.icon}</span>
                  <span className="text-2xl font-bold">{s.value}</span>
                </div>
                <div className="text-xs font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input type="text" placeholder="Buscar ação, usuário ou detalhe..." value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 bg-white shadow-sm" />
            </div>
            <div className="flex gap-2">
              {(['', 'info', 'warning', 'critical'] as const).map(s => (
                <button key={s} onClick={() => setAuditFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    auditFilter === s ? 'bg-navy-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {s === '' ? 'Todos' : s === 'info' ? 'ℹ️ Info' : s === 'warning' ? '⚠️ Alerta' : '🚨 Crítico'}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              📥 Exportar
            </button>
          </div>

          {/* Log list */}
          <div className="space-y-2">
            {filteredAudit.map(log => {
              const sev = severityCfg[log.severity];
              const role = roles[log.role];
              return (
                <div key={log.id} className={`flex gap-4 items-start border rounded-2xl px-5 py-4 ${sev.bg} ${sev.border}`}>
                  <span className="text-xl flex-shrink-0 mt-0.5">{sev.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-gray-800">{log.action}</span>
                      <span className="text-xs bg-white/70 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{log.module}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.color} ${role.bg}`}>{role.icon} {role.label}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">{log.detail}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>👤 {log.userName}</span>
                      <span>🌐 {log.ip}</span>
                      <span>🕐 {fmtDate(log.at)}</span>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${sev.color}`}>
                    {log.severity.toUpperCase()}
                  </div>
                </div>
              );
            })}
            {filteredAudit.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
                Nenhum evento encontrado
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add/Edit modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg,#060f2a,#0d1f4a)' }}>
              <div>
                <h2 className="font-bold text-white text-lg">
                  {modal.mode === 'add' ? 'Novo Usuário do Sistema' : 'Editar Usuário'}
                </h2>
                {modal.user && <p className="text-white/50 text-xs mt-0.5">{modal.user.email}</p>}
              </div>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Role selector */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Perfil de Acesso *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(roles) as [RoleId, typeof roles[RoleId]][]).map(([rid, cfg]) => (
                    <button key={rid} onClick={() => upd('role', rid)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-left transition-all ${form.role === rid ? `${cfg.border} ${cfg.bg}` : 'border-gray-200 hover:border-gray-300'}`}>
                      <span className="text-xl">{cfg.icon}</span>
                      <div>
                        <div className={`text-sm font-semibold ${form.role === rid ? cfg.color : 'text-gray-700'}`}>{cfg.label}</div>
                        <div className="text-xs text-gray-400 leading-tight line-clamp-1">{cfg.description.split('.')[0]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-4">
                {([
                  { label: 'Nome Completo *', key: 'nome', full: true },
                  { label: 'E-mail *', key: 'email', full: true, type: 'email' },
                  { label: 'Departamento', key: 'departamento' },
                  { label: 'Telefone', key: 'telefone', placeholder: '(00) 00000-0000' },
                ] as { label: string; key: keyof typeof emptyUser; full?: boolean; type?: string; placeholder?: string }[]).map(f => (
                  <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={String(form[f.key])}
                      onChange={e => upd(f.key, e.target.value as any)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-100 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => upd('status', e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              {/* Permission preview */}
              {form.role && (
                <div className={`rounded-xl p-3 ${roles[form.role].bg} border ${roles[form.role].border}`}>
                  <div className={`text-xs font-semibold mb-2 ${roles[form.role].color}`}>
                    Módulos que este perfil terá acesso:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {permissions.filter(p => p[form.role] !== false).map(p => (
                      <span key={p.module} className="text-xs bg-white/80 border border-white px-2 py-0.5 rounded-lg text-gray-700">
                        {p.icon} {p.label}
                        {p[form.role] === 'read' && <span className="text-gray-400 ml-1">(leitura)</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSave}
                disabled={!form.nome || !form.email}
                className="flex-1 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#0d1f4a,#2a4fa8)' }}>
                {modal.mode === 'add' ? 'Criar Usuário' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="font-bold text-gray-800 text-lg mb-2">Remover usuário?</h2>
            <p className="text-sm text-gray-500 mb-1">{users.find(u => u.id === deleteConfirm)?.nome}</p>
            <p className="text-xs text-gray-400 mb-6">O usuário perderá todo o acesso ao sistema.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700">Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
