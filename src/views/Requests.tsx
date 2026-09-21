import { useState } from 'react';
import { solicitacoes as initialSols, employees, type SolicitacaoRequest, type RequestType, type RequestStatus } from '../data/mockData';

const tipoConfig: Record<RequestType, { label: string; icon: string; color: string; bg: string }> = {
  ferias:             { label: 'Férias',              icon: '🏖️', color: 'text-blue-700',   bg: 'bg-blue-100' },
  ponto:              { label: 'Correção de Ponto',   icon: '🕐', color: 'text-orange-700', bg: 'bg-orange-100' },
  alteracao_cadastral:{ label: 'Alteração Cadastral', icon: '📝', color: 'text-purple-700', bg: 'bg-purple-100' },
  denuncia:           { label: 'Denúncia',            icon: '🔒', color: 'text-red-700',    bg: 'bg-red-100' },
  sugestao:           { label: 'Sugestão',            icon: '💡', color: 'text-emerald-700',bg: 'bg-emerald-100' },
};

const statusConfig: Record<RequestStatus, { label: string; color: string; bg: string; dot: string }> = {
  aberta:      { label: 'Aberta',      color: 'text-gray-600',   bg: 'bg-gray-100',    dot: 'bg-gray-400' },
  em_analise:  { label: 'Em análise',  color: 'text-amber-700',  bg: 'bg-amber-100',   dot: 'bg-amber-400' },
  concluida:   { label: 'Concluída',   color: 'text-emerald-700',bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  rejeitada:   { label: 'Rejeitada',   color: 'text-red-700',    bg: 'bg-red-100',     dot: 'bg-red-500' },
};

const prioridadeConfig = {
  alta:  { label: 'Alta',  color: 'text-red-600',    bg: 'bg-red-50 border border-red-200' },
  media: { label: 'Média', color: 'text-amber-600',  bg: 'bg-amber-50 border border-amber-200' },
  baixa: { label: 'Baixa', color: 'text-gray-500',   bg: 'bg-gray-50 border border-gray-200' },
};

type FormTipo = RequestType | '';
interface NewRequest {
  tipo: FormTipo; employeeId: string; titulo: string; descricao: string;
  prioridade: 'baixa' | 'media' | 'alta'; anonimo: boolean;
  dataInicioFerias: string; dataFimFerias: string;
  dataPonto: string; horarioEsperado: string;
  campoAlteracao: string; valorAntigo: string; valorNovo: string;
}

const emptyForm: NewRequest = {
  tipo: '', employeeId: '', titulo: '', descricao: '', prioridade: 'media', anonimo: false,
  dataInicioFerias: '', dataFimFerias: '', dataPonto: '', horarioEsperado: '',
  campoAlteracao: '', valorAntigo: '', valorNovo: '',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Requests() {
  const [requests, setRequests] = useState<SolicitacaoRequest[]>(initialSols);
  const [filterTipo, setFilterTipo] = useState<RequestType | ''>('');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | ''>('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<SolicitacaoRequest | null>(null);
  const [form, setForm] = useState<NewRequest>(emptyForm);
  const [resposta, setResposta] = useState('');

  const filtered = requests.filter(r => {
    if (filterTipo && r.tipo !== filterTipo) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (search && !r.titulo.toLowerCase().includes(search.toLowerCase()) &&
        !r.employeeName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSubmit = () => {
    if (!form.tipo || !form.titulo || !form.descricao) return;
    const emp = employees.find(e => e.id === form.employeeId);
    const novo: SolicitacaoRequest = {
      id: `sol${Date.now()}`,
      tipo: form.tipo as RequestType,
      employeeId: form.employeeId,
      employeeName: form.anonimo ? 'Anônimo' : (emp?.nomeCompleto || '—'),
      matricula: form.anonimo ? '—' : (emp?.matricula || '—'),
      departamento: emp?.departamento || '—',
      titulo: form.titulo,
      descricao: form.descricao,
      status: 'aberta',
      prioridade: form.prioridade,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      anonimo: form.anonimo,
      dataInicioFerias: form.dataInicioFerias || undefined,
      dataFimFerias: form.dataFimFerias || undefined,
      dataPonto: form.dataPonto || undefined,
      horarioEsperado: form.horarioEsperado || undefined,
      campoAlteracao: form.campoAlteracao || undefined,
      valorAntigo: form.valorAntigo || undefined,
      valorNovo: form.valorNovo || undefined,
    };
    setRequests(p => [novo, ...p]);
    setShowForm(false);
    setForm(emptyForm);
  };

  const updateStatus = (id: string, status: RequestStatus) => {
    setRequests(p => p.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString(), resolvidoPor: 'Admin RH', resposta: resposta || r.resposta } : r));
    if (detail?.id === id) setDetail(prev => prev ? { ...prev, status, resposta: resposta || prev.resposta } : null);
    setResposta('');
  };

  const counts = {
    total: requests.length,
    aberta: requests.filter(r => r.status === 'aberta').length,
    em_analise: requests.filter(r => r.status === 'em_analise').length,
    alta: requests.filter(r => r.prioridade === 'alta' && r.status !== 'concluida').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Canal de Solicitações</h1>
          <p className="text-sm text-gray-500 mt-1">Férias · Ponto · Cadastro · Denúncias · Sugestões</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-navy-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors shadow-sm">
          + Nova Solicitação
        </button>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'bg-gray-100 text-gray-700' },
          { label: 'Abertas', value: counts.aberta, color: 'bg-blue-100 text-blue-700' },
          { label: 'Em análise', value: counts.em_analise, color: 'bg-amber-100 text-amber-700' },
          { label: 'Prioridade Alta', value: counts.alta, color: 'bg-red-100 text-red-700' },
        ].map(k => (
          <div key={k.label} className={`${k.color} rounded-2xl p-4`}>
            <div className="text-2xl font-bold">{k.value}</div>
            <div className="text-xs font-medium mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Type cards */}
      <div className="grid grid-cols-5 gap-3">
        {(Object.entries(tipoConfig) as [RequestType, typeof tipoConfig[RequestType]][]).map(([tipo, cfg]) => {
          const count = requests.filter(r => r.tipo === tipo).length;
          const active = filterTipo === tipo;
          return (
            <button
              key={tipo}
              onClick={() => setFilterTipo(active ? '' : tipo)}
              className={`rounded-2xl p-4 text-center border-2 transition-all ${active ? 'border-navy-700 bg-navy-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-300'}`}
            >
              <div className="text-2xl mb-1">{cfg.icon}</div>
              <div className="text-lg font-bold text-navy-900">{count}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">{cfg.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input type="text" placeholder="Buscar por colaborador ou título..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 bg-white shadow-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white shadow-sm text-gray-700">
          <option value="">Todos os status</option>
          {(Object.entries(statusConfig) as any[]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* List + Detail */}
      <div className={`grid gap-5 ${detail ? 'grid-cols-1 xl:grid-cols-5' : 'grid-cols-1'}`}>
        {/* List */}
        <div className={`space-y-3 ${detail ? 'xl:col-span-3' : ''}`}>
          {filtered.map(req => {
            const tipo = tipoConfig[req.tipo];
            const st = statusConfig[req.status];
            const pr = prioridadeConfig[req.prioridade];
            return (
              <button key={req.id} onClick={() => setDetail(detail?.id === req.id ? null : req)}
                className={`w-full text-left bg-white rounded-2xl border-2 p-4 shadow-sm hover:shadow-md transition-all ${detail?.id === req.id ? 'border-navy-700' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className={`${tipo.bg} w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>{tipo.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800 truncate">{req.titulo}</span>
                      {req.anonimo && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">anônimo</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {req.employeeName} · {req.departamento} · {fmtDate(req.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pr.color} ${pr.bg}`}>{pr.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${st.color} ${st.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
              Nenhuma solicitação encontrada
            </div>
          )}
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="xl:col-span-2 bg-white rounded-2xl border-2 border-navy-200 shadow-lg p-5 space-y-4 h-fit">
            <div className="flex items-start gap-3">
              <div className={`${tipoConfig[detail.tipo].bg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{tipoConfig[detail.tipo].icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-navy-900 text-sm leading-tight">{detail.titulo}</div>
                <div className="text-xs text-gray-500 mt-1">{tipoConfig[detail.tipo].label} · {fmtDate(detail.createdAt)}</div>
              </div>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="space-y-2 text-sm">
              {[
                { label: 'Solicitante', value: detail.employeeName },
                { label: 'Matrícula', value: detail.matricula },
                { label: 'Departamento', value: detail.departamento },
                detail.dataInicioFerias && { label: 'Período férias', value: `${detail.dataInicioFerias} → ${detail.dataFimFerias}` },
                detail.dataPonto && { label: 'Data do ponto', value: detail.dataPonto },
                detail.horarioEsperado && { label: 'Horário esperado', value: detail.horarioEsperado },
                detail.campoAlteracao && { label: 'Campo', value: detail.campoAlteracao },
                detail.valorAntigo && { label: 'Valor anterior', value: detail.valorAntigo },
                detail.valorNovo && { label: 'Novo valor', value: detail.valorNovo },
              ].filter(Boolean).map((row: any) => (
                <div key={row.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500 w-32 flex-shrink-0">{row.label}</span>
                  <span className="text-xs font-medium text-gray-800 text-right">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-500 mb-1">Descrição</div>
              <p className="text-sm text-gray-700 leading-relaxed">{detail.descricao}</p>
            </div>

            {detail.resposta && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="text-xs font-semibold text-emerald-700 mb-1">Resposta — {detail.resolvidoPor}</div>
                <p className="text-sm text-emerald-800">{detail.resposta}</p>
              </div>
            )}

            {detail.status !== 'concluida' && detail.status !== 'rejeitada' && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <textarea
                  placeholder="Resposta ou observação (opcional)..."
                  value={resposta}
                  onChange={e => setResposta(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-navy-600 resize-none"
                />
                <div className="flex gap-2">
                  {detail.status === 'aberta' && (
                    <button onClick={() => updateStatus(detail.id, 'em_analise')}
                      className="flex-1 border border-amber-300 text-amber-700 bg-amber-50 py-2 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors">
                      Iniciar análise
                    </button>
                  )}
                  <button onClick={() => updateStatus(detail.id, 'concluida')}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors">
                    ✓ Concluir
                  </button>
                  <button onClick={() => updateStatus(detail.id, 'rejeitada')}
                    className="border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors">
                    Rejeitar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New request modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-navy-900 text-lg">Nova Solicitação</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 text-xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Tipo */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Tipo de solicitação *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(tipoConfig) as [RequestType, typeof tipoConfig[RequestType]][]).map(([tipo, cfg]) => (
                    <button key={tipo} onClick={() => setForm(p => ({ ...p, tipo }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${form.tipo === tipo ? 'border-navy-700 bg-navy-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <span>{cfg.icon}</span>
                      <span className="text-xs font-medium text-gray-700 leading-tight">{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colaborador */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Colaborador *</label>
                  <select value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
                    disabled={form.anonimo}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 disabled:opacity-40">
                    <option value="">Selecionar...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.nomeCompleto}</option>)}
                  </select>
                </div>
                {form.tipo === 'denuncia' && (
                  <label className="flex items-center gap-2 mt-5 cursor-pointer">
                    <input type="checkbox" checked={form.anonimo} onChange={e => setForm(p => ({ ...p, anonimo: e.target.checked, employeeId: e.target.checked ? '' : p.employeeId }))} className="w-4 h-4 rounded" />
                    <span className="text-xs font-medium text-gray-600">Anônimo</span>
                  </label>
                )}
              </div>

              {/* Type-specific fields */}
              {form.tipo === 'ferias' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Início</label>
                    <input type="date" value={form.dataInicioFerias} onChange={e => setForm(p => ({ ...p, dataInicioFerias: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600" /></div>
                  <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Fim</label>
                    <input type="date" value={form.dataFimFerias} onChange={e => setForm(p => ({ ...p, dataFimFerias: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600" /></div>
                </div>
              )}
              {form.tipo === 'ponto' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Data do ponto</label>
                    <input type="date" value={form.dataPonto} onChange={e => setForm(p => ({ ...p, dataPonto: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600" /></div>
                  <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Horário esperado</label>
                    <input type="time" value={form.horarioEsperado} onChange={e => setForm(p => ({ ...p, horarioEsperado: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600" /></div>
                </div>
              )}
              {form.tipo === 'alteracao_cadastral' && (
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Campo</label>
                    <input placeholder="Ex: Endereço" value={form.campoAlteracao} onChange={e => setForm(p => ({ ...p, campoAlteracao: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600" /></div>
                  <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Valor atual</label>
                    <input value={form.valorAntigo} onChange={e => setForm(p => ({ ...p, valorAntigo: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600" /></div>
                  <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Novo valor</label>
                    <input value={form.valorNovo} onChange={e => setForm(p => ({ ...p, valorNovo: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600" /></div>
                </div>
              )}

              {/* Título */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Título *</label>
                <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Resumo da solicitação..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Descrição *</label>
                <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  placeholder="Descreva com detalhes..." rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Prioridade</label>
                <div className="flex gap-2">
                  {(['baixa','media','alta'] as const).map(p => (
                    <button key={p} onClick={() => setForm(prev => ({ ...prev, prioridade: p }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${form.prioridade === p ? 'border-navy-700 bg-navy-50 text-navy-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {prioridadeConfig[p].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSubmit}
                disabled={!form.tipo || !form.titulo || !form.descricao}
                className="flex-1 bg-navy-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Enviar Solicitação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
