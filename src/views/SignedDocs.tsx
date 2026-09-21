import { useState } from 'react';
import { signedDocuments, employees } from '../data/mockData';
import type { SignedDocument } from '../data/mockData';

const methodConfig = {
  assinatura_digital:      { label: 'Assinatura Digital',   icon: '✍️', color: 'text-blue-700',   bg: 'bg-blue-100' },
  confirmacao_whatsapp:    { label: 'Confirmação WhatsApp', icon: '💬', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  aceite_email:            { label: 'Aceite por E-mail',    icon: '📧', color: 'text-purple-700',  bg: 'bg-purple-100' },
};

const statusConfig = {
  valido:    { label: 'Válido',    color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  revogado:  { label: 'Revogado', color: 'text-red-700',     bg: 'bg-red-100',     dot: 'bg-red-500' },
  expirado:  { label: 'Expirado', color: 'text-gray-500',    bg: 'bg-gray-100',    dot: 'bg-gray-400' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function SignedDocs() {
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterType, setFilterType] = useState('');
  const [detail, setDetail] = useState<SignedDocument | null>(null);

  const selectedEmp = employees.find(e => e.id === selectedEmpId);

  const allDocs = signedDocuments.filter(d => {
    if (selectedEmpId && d.employeeId !== selectedEmpId) return false;
    if (search && !d.documentTitle.toLowerCase().includes(search.toLowerCase()) &&
        !d.employeeName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterMethod && d.signatureMethod !== filterMethod) return false;
    if (filterType && d.documentType !== filterType) return false;
    return true;
  });

  const docTypes = [...new Set(signedDocuments.map(d => d.documentType))];

  // Per-employee stats when one is selected
  const empDocs = selectedEmpId ? signedDocuments.filter(d => d.employeeId === selectedEmpId) : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Histórico de Documentos Assinados</h1>
          <p className="text-sm text-gray-500 mt-1">Assinaturas digitais · Validade jurídica · Hash SHA-256</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-xl text-sm">
          <span>⚖️</span><span className="font-medium">Rastreabilidade Total</span>
        </div>
      </div>

      {/* Employee selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Filtrar por colaborador:</p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSelectedEmpId('')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!selectedEmpId ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos
          </button>
          {employees.map(emp => {
            const count = signedDocuments.filter(d => d.employeeId === emp.id).length;
            if (!count) return null;
            return (
              <button
                key={emp.id}
                onClick={() => { setSelectedEmpId(emp.id === selectedEmpId ? '' : emp.id); setDetail(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedEmpId === emp.id ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${selectedEmpId === emp.id ? 'bg-white/20 text-white' : 'bg-navy-900 text-white'}`}>{emp.avatar}</span>
                {emp.nomeCompleto.split(' ')[0]}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedEmpId === emp.id ? 'bg-white/20' : 'bg-white'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Selected employee card */}
        {selectedEmp && (
          <div className="mt-4 border-t border-gray-100 pt-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-900 to-navy-600 text-white font-bold flex items-center justify-center">
                {selectedEmp.avatar}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{selectedEmp.nomeCompleto}</div>
                <div className="text-xs text-gray-500">{selectedEmp.matricula} · {selectedEmp.cargo}</div>
              </div>
            </div>
            <div className="flex gap-4 ml-auto flex-wrap">
              {[
                { label: 'Documentos', value: empDocs.length },
                { label: 'Válidos', value: empDocs.filter(d => d.status === 'valido').length },
                { label: 'Assinatura Digital', value: empDocs.filter(d => d.signatureMethod === 'assinatura_digital').length },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-bold text-navy-900">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input type="text" placeholder="Buscar documento ou colaborador..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 bg-white shadow-sm" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm text-gray-700 focus:outline-none">
          <option value="">Todos os tipos</option>
          {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm text-gray-700 focus:outline-none">
          <option value="">Todos os métodos</option>
          {(Object.entries(methodConfig) as any[]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Content */}
      <div className={`grid gap-5 ${detail ? 'grid-cols-1 xl:grid-cols-5' : 'grid-cols-1'}`}>
        {/* Timeline / Table */}
        <div className={detail ? 'xl:col-span-3' : ''}>
          {selectedEmpId ? (
            // Timeline for selected employee
            <div className="relative space-y-0">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
              {allDocs.map((doc, i) => {
                const m = methodConfig[doc.signatureMethod];
                const s = statusConfig[doc.status];
                return (
                  <button key={doc.id} onClick={() => setDetail(detail?.id === doc.id ? null : doc)}
                    className={`w-full text-left flex gap-4 pb-5 relative ${i === allDocs.length - 1 ? 'pb-0' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10 border-2 ${detail?.id === doc.id ? 'border-navy-700 bg-navy-900 text-white' : 'border-white bg-white shadow-md'}`}>
                      {detail?.id === doc.id ? '→' : m.icon}
                    </div>
                    <div className={`flex-1 bg-white rounded-2xl border-2 p-4 shadow-sm hover:shadow-md transition-all ${detail?.id === doc.id ? 'border-navy-700' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{doc.documentTitle}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{fmtDate(doc.signedAt)}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.color} ${m.bg}`}>{m.label}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${s.color} ${s.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs font-mono text-gray-400 truncate">{doc.legalHash}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Table view for all employees
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Colaborador', 'Documento', 'Método', 'Assinado em', 'Status', ''].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allDocs.map(doc => {
                      const m = methodConfig[doc.signatureMethod];
                      const s = statusConfig[doc.status];
                      return (
                        <tr key={doc.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetail(detail?.id === doc.id ? null : doc)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-navy-900 text-white text-xs font-bold flex items-center justify-center">
                                {doc.employeeName.split(' ').slice(0,2).map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-800 whitespace-nowrap">{doc.employeeName}</div>
                                <div className="text-xs text-gray-400">{doc.matricula}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-800 whitespace-nowrap">{doc.documentTitle}</div>
                            <div className="text-xs text-gray-400">{doc.documentType} · {doc.fileSize}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${m.color} ${m.bg}`}>{m.icon} {m.label}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(doc.signedAt)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${s.color} ${s.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-xs text-navy-700 hover:text-navy-900 font-medium">Ver →</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {allDocs.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">Nenhum documento encontrado</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="xl:col-span-2 bg-white rounded-2xl border-2 border-navy-200 shadow-lg p-5 h-fit space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-navy-900">Certificado de Assinatura</h2>
              <div className="flex gap-2">
                <button className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">🖨️</button>
                <button className="text-xs bg-navy-900 text-white px-3 py-1.5 rounded-lg hover:bg-navy-700">📥 PDF</button>
                <button onClick={() => setDetail(null)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 text-lg">×</button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-navy-900 to-navy-700 text-white rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">✍️</span>
                <div>
                  <div className="font-bold text-sm">DOCUMENTO ASSINADO</div>
                  <div className="text-xs text-white/60">{detail.documentType}</div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <div className="text-xs text-white/60 mb-0.5">Documento</div>
                <div className="font-semibold text-sm">{detail.documentTitle}</div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Signatário', value: detail.signedBy },
                { label: 'Matrícula', value: detail.matricula },
                { label: 'Método', value: `${methodConfig[detail.signatureMethod].icon} ${methodConfig[detail.signatureMethod].label}` },
                { label: 'Data/Hora', value: fmtDate(detail.signedAt) },
                { label: 'IP de Origem', value: detail.ipAddress },
                { label: 'Tamanho', value: detail.fileSize || '—' },
                { label: 'Situação', value: statusConfig[detail.status].label },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500 w-32 flex-shrink-0">{row.label}</span>
                  <span className="text-xs font-medium text-gray-800 text-right">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-600 mb-1.5">🔒 Hash SHA-256</div>
              <div className="font-mono text-xs text-gray-500 break-all leading-relaxed">{detail.legalHash}</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="text-xs text-amber-800 leading-relaxed">
                <strong>⚖️ Validade Jurídica:</strong> Assinatura eletrônica com rastreabilidade completa — IP, timestamp e hash criptográfico. Válido conforme Lei nº 14.063/2020.
              </div>
            </div>

            <div className="text-center">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusConfig[detail.status].color} ${statusConfig[detail.status].bg}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig[detail.status].dot}`} />
                {statusConfig[detail.status].label.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
