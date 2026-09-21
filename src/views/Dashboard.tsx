import { employees, historyEntries, sendConfirmations, solicitacoes, signedDocuments } from '../data/mockData';
import type { View } from '../App';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function Dashboard({ onNavigate }: DashboardProps) {
  const totalEmployees = employees.filter(e => e.status !== 'inativo').length;
  const onFerias = employees.filter(e => e.status === 'ferias').length;
  const totalSent = historyEntries.filter(h => h.status === 'entregue').length;
  const pendingRequests = solicitacoes.filter(s => s.status === 'aberta' || s.status === 'em_analise').length;
  const highPriority = solicitacoes.filter(s => s.prioridade === 'alta' && s.status !== 'concluida').length;
  const totalSigned = signedDocuments.filter(d => d.status === 'valido').length;
  const totalConfirmations = sendConfirmations.filter(c => c.status === 'entregue').length;

  const kpis = [
    { label: 'Colaboradores Ativos', value: totalEmployees, sub: `${onFerias} em férias`, icon: '👥', gradient: 'from-[#0d1f4a] to-[#2a4fa8]', onClick: () => onNavigate('employees') },
    { label: 'Documentos Enviados', value: totalSent, sub: 'com comprovante', icon: '📤', gradient: 'from-emerald-700 to-emerald-500', onClick: () => onNavigate('history') },
    { label: 'Solicitações Abertas', value: pendingRequests, sub: `${highPriority} prioridade alta`, icon: '📬', gradient: highPriority > 0 ? 'from-amber-600 to-amber-400' : 'from-blue-600 to-blue-400', onClick: () => onNavigate('requests') },
    { label: 'Doc. Assinados Válidos', value: totalSigned, sub: 'validade jurídica', icon: '✍️', gradient: 'from-purple-800 to-purple-600', onClick: () => onNavigate('signed') },
  ];

  const recentRequests = solicitacoes.filter(s => s.status === 'aberta').slice(0, 3);
  const recentHistory = historyEntries.slice(0, 5);

  const tipoIcon: Record<string, string> = {
    ferias: '🏖️', ponto: '🕐', alteracao_cadastral: '📝', denuncia: '🔒', sugestao: '💡',
  };

  const methodCounts = {
    email: historyEntries.filter(h => h.sendMethod === 'email').length,
    whatsapp: historyEntries.filter(h => h.sendMethod === 'whatsapp').length,
    ambos: historyEntries.filter(h => h.sendMethod === 'ambos').length,
  };
  const total = methodCounts.email + methodCounts.whatsapp + methodCounts.ambos;

  const requestBySatus = {
    aberta: solicitacoes.filter(s => s.status === 'aberta').length,
    em_analise: solicitacoes.filter(s => s.status === 'em_analise').length,
    concluida: solicitacoes.filter(s => s.status === 'concluida').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Painel Principal</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('admission')}
            className="flex items-center gap-2 border border-navy-900 text-navy-900 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-50 transition-colors">
            📋 Nova Admissão
          </button>
          <button onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#0d1f4a,#2a4fa8)' }}>
            📤 Importar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <button key={k.label} onClick={k.onClick}
            className={`bg-gradient-to-br ${k.gradient} rounded-2xl p-5 text-left shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}>
            <div className="text-3xl mb-3">{k.icon}</div>
            <div className="text-3xl font-bold text-white">{k.value}</div>
            <div className="text-sm font-semibold text-white/90 mt-1">{k.label}</div>
            <div className="text-xs text-white/60 mt-0.5">{k.sub}</div>
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: recent sends */}
        <div className="xl:col-span-2 space-y-5">
          {/* Recent activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-navy-900">Envios Recentes</h2>
              <button onClick={() => onNavigate('history')} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Ver tudo →</button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentHistory.map(entry => (
                <div key={entry.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#0d1f4a,#2a4fa8)' }}>
                    {entry.employeeName.split(' ').slice(0,2).map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{entry.employeeName}</div>
                    <div className="text-xs text-gray-500 truncate">{entry.documentType} · {entry.createdBy}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-base">{entry.sendMethod === 'email' ? '📧' : entry.sendMethod === 'whatsapp' ? '💬' : '📧💬'}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      entry.status === 'entregue' ? 'bg-emerald-100 text-emerald-700' :
                      entry.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {entry.status === 'entregue' ? 'Entregue' : entry.status === 'pendente' ? 'Pendente' : 'Falhou'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open requests */}
          {recentRequests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-navy-900">Solicitações Abertas</h2>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{pendingRequests}</span>
                </div>
                <button onClick={() => onNavigate('requests')} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Ver tudo →</button>
              </div>
              <div className="divide-y divide-gray-50">
                {recentRequests.map(req => (
                  <div key={req.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <span className="text-xl mt-0.5 flex-shrink-0">{tipoIcon[req.tipo]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{req.titulo}</div>
                      <div className="text-xs text-gray-500">{req.employeeName} · {fmtDate(req.createdAt)}</div>
                    </div>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      req.prioridade === 'alta' ? 'bg-red-100 text-red-700' :
                      req.prioridade === 'media' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{req.prioridade}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Request breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-navy-900 mb-4">Solicitações por Status</h2>
            <div className="space-y-2.5">
              {[
                { label: 'Abertas', count: requestBySatus.aberta, color: 'bg-blue-400' },
                { label: 'Em análise', count: requestBySatus.em_analise, color: 'bg-amber-400' },
                { label: 'Concluídas', count: requestBySatus.concluida, color: 'bg-emerald-500' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 text-xs">{m.label}</span>
                    <span className="font-semibold text-gray-800 text-xs">{m.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full`} style={{ width: `${solicitacoes.length ? (m.count / solicitacoes.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Send channels */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-navy-900 mb-4">Canais de Envio</h2>
            <div className="space-y-2.5">
              {[
                { label: 'E-mail', count: methodCounts.email, icon: '📧', color: 'bg-blue-500' },
                { label: 'WhatsApp', count: methodCounts.whatsapp, icon: '💬', color: 'bg-emerald-500' },
                { label: 'Ambos', count: methodCounts.ambos, icon: '📤', color: 'bg-purple-500' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5 text-gray-600 text-xs"><span>{m.icon}</span>{m.label}</span>
                    <span className="font-semibold text-gray-800 text-xs">{m.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full`} style={{ width: `${total ? (m.count / total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(160deg,#060f2a,#1e3a8a)' }}>
            <h2 className="font-semibold mb-3 text-sm">Ações Rápidas</h2>
            <div className="space-y-2">
              {[
                { label: 'Nova Admissão', icon: '📋', view: 'admission' as View },
                { label: 'Importar PDF', icon: '📄', view: 'upload' as View },
                { label: 'Nova Solicitação', icon: '📬', view: 'requests' as View },
                { label: 'Ver Comprovantes', icon: '🔐', view: 'confirmations' as View },
              ].map(a => (
                <button key={a.label} onClick={() => onNavigate(a.view)}
                  className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors text-left">
                  <span>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex gap-3">
              <span className="text-xl">⚖️</span>
              <div>
                <div className="text-sm font-semibold text-amber-800">Validade Jurídica</div>
                <div className="text-xs text-amber-700 mt-1 leading-relaxed">
                  {totalConfirmations} comprovantes ativos com hash SHA-256 e timestamp. Válidos em processos trabalhistas conforme Lei 14.063/2020.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
