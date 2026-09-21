import { useState } from 'react';
import { sendConfirmations } from '../data/mockData';

export default function Confirmations() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = sendConfirmations.filter(c =>
    !search ||
    c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    c.confirmationCode.toLowerCase().includes(search.toLowerCase()) ||
    c.matricula.toLowerCase().includes(search.toLowerCase())
  );

  const detail = sendConfirmations.find(c => c.id === selected);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Comprovantes de Envio</h1>
          <p className="text-sm text-gray-500 mt-1">Válidos juridicamente — hash SHA-256, IP e timestamp auditáveis</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-xl text-sm">
          <span>⚖️</span>
          <span className="font-medium">Validade Jurídica Ativa</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Buscar por colaborador, matrícula ou código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-navy-600 shadow-sm"
        />
      </div>

      <div className={`grid gap-6 ${detail ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Cards */}
        <div className="space-y-3">
          {filtered.map(conf => (
            <button
              key={conf.id}
              onClick={() => setSelected(selected === conf.id ? null : conf.id)}
              className={`w-full text-left bg-white rounded-2xl border-2 p-5 shadow-sm hover:shadow-md transition-all ${
                selected === conf.id ? 'border-navy-700' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-900 to-navy-700 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {conf.employeeName.split(' ').slice(0,2).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{conf.employeeName}</div>
                    <div className="text-xs text-gray-500">{conf.matricula} · CPF: {conf.cpf}</div>
                  </div>
                </div>
                <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                  conf.status === 'entregue' ? 'bg-emerald-100 text-emerald-700' :
                  conf.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {conf.status === 'entregue' ? '✓ Entregue' : conf.status === 'pendente' ? '⏳ Pendente' : '✕ Falhou'}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div><span className="text-gray-400">Documento:</span> <span className="text-gray-700 font-medium">{conf.documentType}</span></div>
                <div><span className="text-gray-400">Canal:</span> <span className="text-gray-700 font-medium">{conf.sendMethod === 'email' ? '📧 E-mail' : conf.sendMethod === 'whatsapp' ? '💬 WhatsApp' : '📤 Ambos'}</span></div>
                <div><span className="text-gray-400">Enviado em:</span> <span className="text-gray-700">{formatDate(conf.sentAt)}</span></div>
                <div><span className="text-gray-400">Código:</span> <span className="font-mono text-navy-700">{conf.confirmationCode}</span></div>
              </div>
              <div className="mt-3 bg-gray-50 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-500 truncate">
                🔐 {conf.legalHash}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              Nenhum comprovante encontrado
            </div>
          )}
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="bg-white rounded-2xl border-2 border-navy-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-navy-900 text-lg">Comprovante Jurídico</h2>
              <div className="flex gap-2">
                <button className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">🖨️ Imprimir</button>
                <button className="text-xs bg-navy-900 text-white px-3 py-1.5 rounded-lg hover:bg-navy-700 transition-colors">📥 PDF</button>
              </div>
            </div>

            {/* Header stamp */}
            <div className="bg-gradient-to-r from-navy-900 to-navy-700 text-white rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔐</div>
                <div>
                  <div className="font-bold">COMPROVANTE DE ENVIO ELETRÔNICO</div>
                  <div className="text-xs text-white/70 mt-0.5">RHeasy · Sistema de Gestão Documental</div>
                </div>
              </div>
              <div className="mt-3 bg-white/10 rounded-lg px-3 py-2">
                <div className="text-xs text-white/70">Código de Confirmação</div>
                <div className="font-mono font-bold text-gold-300">{detail.confirmationCode}</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              {[
                { label: 'Colaborador', value: detail.employeeName },
                { label: 'Matrícula', value: detail.matricula },
                { label: 'CPF', value: detail.cpf },
                { label: 'Tipo de Documento', value: detail.documentType },
                { label: 'Canal de Envio', value: detail.sendMethod === 'email' ? '📧 E-mail' : detail.sendMethod === 'whatsapp' ? '💬 WhatsApp' : '📤 E-mail e WhatsApp' },
                { label: 'Destinatário', value: detail.recipientEmail || detail.recipientPhone || '—' },
                { label: 'Enviado em', value: formatDate(detail.sentAt) },
                { label: 'Entregue em', value: detail.deliveredAt ? formatDate(detail.deliveredAt) : '—' },
                { label: 'Enviado por', value: detail.sentBy },
                { label: 'IP de Origem', value: detail.ipAddress },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500 flex-shrink-0 w-36">{row.label}</span>
                  <span className="text-sm text-gray-800 font-medium text-right">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Hash */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-600 mb-2">🔒 Assinatura Digital (SHA-256)</div>
              <div className="font-mono text-xs text-gray-600 break-all leading-relaxed">{detail.legalHash}</div>
            </div>

            {/* Legal notice */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="text-xs text-amber-800 leading-relaxed">
                <strong>⚖️ Validade Jurídica:</strong> Este comprovante contém hash criptográfico SHA-256, IP de origem, timestamp e identificação do emissor. Pode ser utilizado como prova em processos trabalhistas e administrativos, conforme Lei nº 14.063/2020 e MP nº 2.200-2/2001.
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                detail.status === 'entregue' ? 'bg-emerald-100 text-emerald-700' :
                detail.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {detail.status === 'entregue' ? '✅ ENTREGUE COM SUCESSO' : detail.status === 'pendente' ? '⏳ AGUARDANDO CONFIRMAÇÃO' : '❌ FALHA NO ENVIO'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
