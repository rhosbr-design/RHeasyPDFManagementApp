import { useState, useRef } from 'react';
import { employees, type PDFPage } from '../data/mockData';
import type { Employee } from '../data/mockData';

// ─── Identification engine ────────────────────────────────────────────────────

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // strip accents
    .replace(/[^a-z0-9\s]/g, '')       // strip punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMatricula(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

type MatchResult = {
  employee: Employee;
  confidence: number;
  method: string;
};

function identifyEmployee(pageText: string, employeeList: Employee[]): MatchResult | null {
  const normPage = normalize(pageText);
  const pageWords = normPage.split(' ');
  const normPageMat = normalizeMatricula(pageText);

  let best: MatchResult | null = null;

  for (const emp of employeeList) {
    let confidence = 0;
    const methods: string[] = [];
    const normName = normalize(emp.nomeCompleto);
    const normMat = normalizeMatricula(emp.matricula);
    const nameParts = normName.split(' ').filter(p => p.length > 2);

    // Exact full name match
    if (normPage.includes(normName)) {
      confidence = Math.max(confidence, 100);
      methods.push('nome completo');
    }

    // Matricula match (normalized, ignores MAT- prefix and dashes)
    if (normPageMat.includes(normMat)) {
      confidence = Math.max(confidence, 95);
      methods.push('matrícula');
    }

    // First + last name (skip middle names)
    if (nameParts.length >= 2) {
      const firstLast = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
      if (normPage.includes(firstLast)) {
        confidence = Math.max(confidence, 88);
        methods.push('primeiro e último nome');
      }
    }

    // Count how many name tokens appear on the page
    const matchingParts = nameParts.filter(part => pageWords.includes(part));
    const partRatio = matchingParts.length / Math.max(nameParts.length, 1);
    if (partRatio >= 0.75 && matchingParts.length >= 2) {
      const partConf = Math.round(60 + partRatio * 25);
      if (partConf > confidence) {
        confidence = partConf;
        methods.push('partes do nome');
      }
    }

    // First name only (lower confidence)
    if (nameParts[0] && pageWords.includes(nameParts[0]) && matchingParts.length >= 1) {
      if (confidence < 50) {
        confidence = Math.max(confidence, 45);
        methods.push('primeiro nome');
      }
    }

    if (confidence > 0 && (!best || confidence > best.confidence)) {
      best = { employee: emp, confidence, method: methods[0] };
    }
  }

  return best && best.confidence >= 45 ? best : null;
}

// ─── Mock PDF page texts (simulate what OCR/parser would extract) ─────────────

type DocType = 'holerite' | 'espelho_ponto';

function generateMockPages(docType: DocType): Array<{
  id: string; pageNumber: number; rawText: string;
}> {
  const docLabel = docType === 'holerite' ? 'Holerite' : 'Espelho de Ponto';
  const period = docType === 'holerite' ? 'Julho/2026' : '01/07/2026 a 31/07/2026';

  return [
    { id: 'p1', pageNumber: 1, rawText: `${docLabel} ${period}\nNome: Ana Paula Ferreira Santos\nMatrícula: MAT-2301\nCPF: 123.456.789-00\nDepartamento: Recursos Humanos` },
    { id: 'p2', pageNumber: 2, rawText: `${docLabel}\nCarlos Eduardo Lima Souza\nMAT-2302\nFinanceiro\nCompetência ${period}` },
    { id: 'p3', pageNumber: 3, rawText: `${docLabel}\nColaborador: MARIANA OLIVEIRA COSTA\nMatricula 2303\n${period}` },
    { id: 'p4', pageNumber: 4, rawText: `${docLabel}\nRoberto Pereira\nRH: MAT2304\nComercial` },
    { id: 'p5', pageNumber: 5, rawText: `${docLabel}\n${period}\nFuncionario: Juliana Rodrigues\nmat: 2305` },
    { id: 'p6', pageNumber: 6, rawText: `${docLabel}\nFernando Gomes\nMAT-2306\nOperações\n${period}` },
    { id: 'p7', pageNumber: 7, rawText: `${docLabel}\nCristina Mendes Barbosa\n2307\nJurídico` },
    { id: 'p8', pageNumber: 8, rawText: `${docLabel} ${period}\nPaulo Henrique\nLogística\nCPF: 890.123.456-77` },
    { id: 'p9', pageNumber: 9, rawText: `${docLabel}\nEmpresa Demo S.A.\n${period}\nPágina sem colaborador identificado` },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

type Phase = 'upload' | 'processing' | 'split' | 'send';

interface MatchedPage {
  id: string;
  pageNumber: number;
  rawText: string;
  match: MatchResult | null;
  override: string | null; // employee id chosen manually
  status: 'identificado' | 'parcial' | 'nao_identificado';
}

const docTypeOptions: { value: DocType; label: string; icon: string; desc: string }[] = [
  { value: 'holerite', label: 'Holerite', icon: '💰', desc: 'Contracheque / Folha de pagamento' },
  { value: 'espelho_ponto', label: 'Espelho de Ponto', icon: '🕐', desc: 'Registro de frequência e horas trabalhadas' },
];

export default function UploadPDF() {
  const [docType, setDocType] = useState<DocType>('holerite');
  const [phase, setPhase] = useState<Phase>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [pages, setPages] = useState<MatchedPage[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendMethod, setSendMethod] = useState<'email' | 'whatsapp' | 'ambos'>('email');
  const [sendSuccess, setSendSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (name: string) => {
    setFileName(name);
    setPhase('processing');
    setProgress(0);

    const steps = [
      { pct: 20, label: 'Lendo estrutura do PDF...' },
      { pct: 45, label: 'Extraindo texto de cada página...' },
      { pct: 70, label: 'Normalizando nomes e matrículas...' },
      { pct: 88, label: 'Cruzando com cadastro de colaboradores...' },
      { pct: 100, label: 'Finalizando identificação...' },
    ];
    let stepIdx = 0;

    const tick = setInterval(() => {
      const target = steps[stepIdx]?.pct ?? 100;
      setProgress(p => {
        const next = p + (target - p) * 0.25 + Math.random() * 3;
        if (next >= target) {
          setProgressLabel(steps[stepIdx]?.label ?? '');
          stepIdx++;
          if (stepIdx >= steps.length) {
            clearInterval(tick);
            const raw = generateMockPages(docType);
            const matched: MatchedPage[] = raw.map(rp => {
              const match = identifyEmployee(rp.rawText, employees);
              return {
                id: rp.id,
                pageNumber: rp.pageNumber,
                rawText: rp.rawText,
                match,
                override: null,
                status: match
                  ? match.confidence >= 85 ? 'identificado' : 'parcial'
                  : 'nao_identificado',
              };
            });
            setTimeout(() => { setPages(matched); setPhase('split'); }, 500);
          }
        }
        return Math.min(next, 100);
      });
    }, 120);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') processFile(f.name);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const selectAll = () => {
    setSelected(new Set(pages.filter(p => p.match || p.override).map(p => p.id)));
  };

  const setOverride = (pageId: string, empId: string) => {
    setPages(prev => prev.map(p => p.id === pageId
      ? { ...p, override: empId || null, status: empId ? 'identificado' : 'nao_identificado' }
      : p));
  };

  const effectiveEmployee = (p: MatchedPage) => {
    if (p.override) return employees.find(e => e.id === p.override) || null;
    return p.match?.employee || null;
  };

  const reset = () => {
    setPhase('upload'); setFileName(''); setProgress(0); setProgressLabel('');
    setPages([]); setSelected(new Set()); setSendSuccess(false); setSendMethod('email');
  };

  const identified = pages.filter(p => p.status === 'identificado');
  const partial = pages.filter(p => p.status === 'parcial');
  const none = pages.filter(p => p.status === 'nao_identificado');

  // ── Upload screen ────────────────────────────────────────────────────────────
  if (phase === 'upload') {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Importar PDF</h1>
          <p className="text-sm text-gray-500 mt-1">Selecione o tipo de documento e envie o PDF para divisão automática</p>
        </div>

        {/* Doc type selector */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Tipo de documento:</p>
          <div className="grid grid-cols-2 gap-3">
            {docTypeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDocType(opt.value)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  docType === opt.value
                    ? 'border-navy-700 bg-navy-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-3xl">{opt.icon}</span>
                <div>
                  <div className={`text-sm font-bold ${docType === opt.value ? 'text-navy-900' : 'text-gray-700'}`}>{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                </div>
                {docType === opt.value && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-navy-900 flex items-center justify-center text-white text-xs flex-shrink-0">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={`drop-zone p-14 flex flex-col items-center justify-center cursor-pointer text-center ${dragOver ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <div className="text-5xl mb-4">{docTypeOptions.find(o => o.value === docType)?.icon}</div>
          <h3 className="text-base font-semibold text-navy-900 mb-1">
            Arraste o PDF de {docTypeOptions.find(o => o.value === docType)?.label} aqui
          </h3>
          <p className="text-sm text-gray-500 mb-4">ou clique para selecionar o arquivo</p>
          <div className="bg-navy-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">
            Selecionar PDF
          </div>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f.name); }} />
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '🔍', title: 'Reconhecimento Avançado', desc: 'Nome completo, parcial, matrícula com ou sem prefixo, sem acentos' },
            { icon: '✂️', title: 'Divisão por Página', desc: 'Cada colaborador recebe somente o seu documento' },
            { icon: '📨', title: 'Envio Múltiplo', desc: 'E-mail, WhatsApp ou ambos com comprovante jurídico' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-xs font-semibold text-navy-900 mb-1">{f.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Processing screen ────────────────────────────────────────────────────────
  if (phase === 'processing') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="#0d1f4a" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - Math.min(progress, 100) / 100)}`}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.2s' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-navy-900">
              {Math.min(Math.round(progress), 100)}%
            </div>
          </div>
          <h2 className="text-xl font-bold text-navy-900 mb-1">Processando PDF</h2>
          <p className="text-sm font-medium text-gray-700 truncate mb-1">{fileName}</p>
          <p className="text-xs text-gray-400 mb-4 h-4">{progressLabel}</p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-navy-900 to-navy-600 rounded-full transition-all duration-200"
              style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-4">Motor de reconhecimento: nome completo · nome parcial · matrícula normalizada</p>
        </div>
      </div>
    );
  }

  // ── Split screen ─────────────────────────────────────────────────────────────
  if (phase === 'split') {
    const docLabel = docTypeOptions.find(o => o.value === docType)?.label;
    return (
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Páginas — {docLabel}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {identified.length} alta confiança
              </span>
              {partial.length > 0 && (
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  {partial.length} confiança parcial
                </span>
              )}
              {none.length > 0 && (
                <span className="flex items-center gap-1 text-gray-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                  {none.length} não identificado
                </span>
              )}
              <span className="text-gray-400">· {fileName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={reset} className="text-sm text-gray-500 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              ← Novo PDF
            </button>
            <button onClick={selectAll} className="text-sm text-navy-900 px-3 py-2 rounded-xl border border-navy-900 font-medium hover:bg-navy-50 transition-colors">
              Sel. todos identificados
            </button>
            <button
              onClick={() => { setPhase('send'); setTimeout(() => setSendSuccess(true), 1200); }}
              disabled={selected.size === 0}
              className="bg-navy-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Enviar {selected.size > 0 ? `(${selected.size})` : ''} →
            </button>
          </div>
        </div>

        {/* Send method + doc type reminder */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-600 pr-4 border-r border-gray-200">
            <span>{docTypeOptions.find(o => o.value === docType)?.icon}</span>
            <span className="font-medium">{docLabel}</span>
          </div>
          <span className="text-sm font-medium text-gray-600">Canal:</span>
          {([
            { value: 'email', label: '📧 E-mail' },
            { value: 'whatsapp', label: '💬 WhatsApp' },
            { value: 'ambos', label: '📤 Ambos' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => setSendMethod(opt.value)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                sendMethod === opt.value ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Pages grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {pages.map(page => {
            const emp = effectiveEmployee(page);
            const isSelected = selected.has(page.id);
            const conf = page.override ? 100 : page.match?.confidence ?? 0;
            const method = page.override
              ? 'seleção manual'
              : page.match?.method ?? '';

            const borderClass = isSelected
              ? 'border-navy-700 shadow-lg'
              : page.status === 'identificado' ? 'border-emerald-200'
              : page.status === 'parcial' ? 'border-amber-300'
              : 'border-gray-200';

            const bgClass = page.status === 'identificado' ? 'bg-emerald-50'
              : page.status === 'parcial' ? 'bg-amber-50'
              : 'bg-gray-50';

            return (
              <div
                key={page.id}
                className={`page-card bg-white rounded-2xl border-2 ${borderClass} p-3 cursor-pointer`}
                onClick={() => emp && toggleSelect(page.id)}
              >
                {/* Mini preview */}
                <div className={`h-24 rounded-xl mb-2.5 flex flex-col items-center justify-center relative ${bgClass}`}>
                  <span className="text-xl mb-0.5">📃</span>
                  <span className="text-xs font-bold text-navy-900">Pág. {page.pageNumber}</span>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-navy-900 rounded-full flex items-center justify-center text-white text-xs leading-none">✓</div>
                  )}
                  {/* Confidence bar */}
                  {emp && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
                      <div
                        className={`h-full ${conf >= 85 ? 'bg-emerald-400' : conf >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${conf}%` }}
                      />
                    </div>
                  )}
                </div>

                {emp ? (
                  <div>
                    <div className="text-xs font-semibold text-gray-800 truncate leading-tight">{emp.nomeCompleto}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">{emp.matricula}</div>
                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        conf >= 85 ? 'bg-emerald-100 text-emerald-700' :
                        conf >= 60 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {conf}% · {method}
                      </span>
                    </div>
                    {/* Allow override even on matched pages */}
                    <select
                      className="mt-2 w-full text-xs border border-gray-200 rounded-lg px-1.5 py-1 text-gray-600 focus:outline-none focus:border-navy-600 bg-white"
                      value={page.override || ''}
                      onChange={e => setOverride(page.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                    >
                      <option value="">↔ Manter / Trocar colaborador</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.nomeCompleto} ({e.matricula})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-gray-400 font-medium mb-1.5">Não identificado</div>
                    <select
                      className="w-full text-xs border border-amber-300 rounded-lg px-1.5 py-1.5 text-gray-700 focus:outline-none focus:border-navy-600 bg-amber-50"
                      value={page.override || ''}
                      onChange={e => setOverride(page.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                    >
                      <option value="">Selecionar colaborador...</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.nomeCompleto} ({e.matricula})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Identification legend */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-600 mb-2">Como a identificação funciona:</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span><span className="text-emerald-600 font-semibold">85–100%</span> — nome completo ou matrícula exata</span>
            <span><span className="text-amber-600 font-semibold">60–84%</span> — primeiro+último nome ou matrícula sem prefixo</span>
            <span><span className="text-red-500 font-semibold">&lt;60%</span> — partes do nome detectadas (confirme manualmente)</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Send screen ──────────────────────────────────────────────────────────────
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        {!sendSuccess ? (
          <>
            <div className="text-5xl mb-4 animate-pulse">📨</div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Enviando documentos</h2>
            <p className="text-sm text-gray-500">
              {selected.size} {docTypeOptions.find(o => o.value === docType)?.label}(s) via {sendMethod === 'email' ? 'E-mail' : sendMethod === 'whatsapp' ? 'WhatsApp' : 'E-mail e WhatsApp'}...
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-emerald-700 mb-2">Documentos Enviados!</h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>{selected.size}</strong> {docTypeOptions.find(o => o.value === docType)?.label}(s) enviados via{' '}
              <strong>{sendMethod === 'email' ? 'E-mail' : sendMethod === 'whatsapp' ? 'WhatsApp' : 'E-mail e WhatsApp'}</strong>
            </p>
            <p className="text-xs text-gray-500 mb-6">Comprovantes jurídicos com hash SHA-256 gerados automaticamente</p>
            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="bg-navy-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">
                Novo PDF
              </button>
              <button className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Ver Comprovantes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
