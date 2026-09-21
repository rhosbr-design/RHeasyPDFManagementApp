import { useState, useRef } from 'react';
import type { AdmissionDoc } from '../data/mockData';

type Step = 'docs' | 'pessoal' | 'profissional' | 'bancario' | 'revisao' | 'aprovacao' | 'concluida';

interface AdmissionForm {
  nomeCompleto: string; dataNascimento: string; cpf: string; rg: string;
  orgaoEmissor: string; nomeMae: string; nomePai: string;
  email: string; telefone: string;
  cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string;
  cargo: string; departamento: string; salario: string; dataAdmissao: string; tipoContrato: string; cargaHoraria: string;
  banco: string; agencia: string; conta: string; tipoConta: string; pix: string;
}

const emptyForm: AdmissionForm = {
  nomeCompleto: '', dataNascimento: '', cpf: '', rg: '', orgaoEmissor: '', nomeMae: '', nomePai: '',
  email: '', telefone: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  cargo: '', departamento: '', salario: '', dataAdmissao: '', tipoContrato: 'CLT', cargaHoraria: '44',
  banco: '', agencia: '', conta: '', tipoConta: 'corrente', pix: '',
};

const docTemplates: AdmissionDoc[] = [
  { id: 'd1', tipo: 'rg', label: 'RG / CNH', status: 'pendente' },
  { id: 'd2', tipo: 'cpf', label: 'CPF', status: 'pendente' },
  { id: 'd3', tipo: 'ctps', label: 'CTPS (Carteira de Trabalho)', status: 'pendente' },
  { id: 'd4', tipo: 'comprovante_residencia', label: 'Comprovante de Residência', status: 'pendente' },
  { id: 'd5', tipo: 'foto', label: 'Foto 3×4', status: 'pendente' },
  { id: 'd6', tipo: 'titulo_eleitor', label: 'Título de Eleitor', status: 'pendente' },
  { id: 'd7', tipo: 'certidao_nascimento', label: 'Certidão de Nascimento/Casamento', status: 'pendente' },
  { id: 'd8', tipo: 'diploma', label: 'Diploma / Certificado', status: 'pendente' },
];

const ocrMockData: Record<string, Partial<AdmissionForm>> = {
  rg: { rg: '12.345.678-9', orgaoEmissor: 'SSP-SP', nomeCompleto: 'Lucas Henrique Tavares', dataNascimento: '1995-06-22', nomeMae: 'Simone Tavares', nomePai: 'Eduardo Tavares' },
  cpf: { cpf: '987.654.321-00' },
  ctps: { nomeCompleto: 'Lucas Henrique Tavares', dataNascimento: '1995-06-22' },
  comprovante_residencia: { logradouro: 'Rua das Acácias', numero: '342', bairro: 'Jardim América', cidade: 'São Paulo', estado: 'SP', cep: '04567-890' },
  diploma: { cargo: 'Analista de Sistemas' },
};

const steps: { id: Step; label: string; icon: string }[] = [
  { id: 'docs', label: 'Documentos', icon: '📄' },
  { id: 'pessoal', label: 'Dados Pessoais', icon: '👤' },
  { id: 'profissional', label: 'Dados Profissionais', icon: '💼' },
  { id: 'bancario', label: 'Dados Bancários', icon: '🏦' },
  { id: 'revisao', label: 'Revisão', icon: '✅' },
  { id: 'aprovacao', label: 'Aprovação', icon: '📝' },
];

const stepOrder: Step[] = ['docs', 'pessoal', 'profissional', 'bancario', 'revisao', 'aprovacao', 'concluida'];

export default function Admission() {
  const [step, setStep] = useState<Step>('docs');
  const [form, setForm] = useState<AdmissionForm>(emptyForm);
  const [docs, setDocs] = useState<AdmissionDoc[]>(docTemplates);
  const [readingDoc, setReadingDoc] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [cameraModal, setCameraModal] = useState<string | null>(null);
  const [scannerModal, setScannerModal] = useState<string | null>(null);
  const [fichaModal, setFichaModal] = useState<'print' | 'sign' | null>(null);

  const upd = (field: keyof AdmissionForm, val: string) => setForm(p => ({ ...p, [field]: val }));

  const handleDocProcess = (docId: string, delay: number = 1800) => {
    const doc = docs.find(d => d.id === docId)!;
    setReadingDoc(docId);
    setCameraModal(null);
    setScannerModal(null);
    setTimeout(() => {
      const extracted = ocrMockData[doc.tipo] || {};
      setForm(prev => ({ ...prev, ...extracted }));
      setDocs(prev => prev.map(d => d.id === docId
        ? { ...d, status: 'lido', fileName: `${doc.label}.pdf`, extractedData: Object.fromEntries(Object.entries(extracted).map(([k, v]) => [k, v as string])) }
        : d));
      setReadingDoc(null);
      const fields = Object.keys(extracted);
      
      setNotifications(prev => [
        `☁️ "${doc.label}" foi salvo no Drive Corporativo.`,
        ...(fields.length ? [`🤖 Leitura: ${fields.length} campo(s) extraído(s)`] : []),
        ...prev
      ].slice(0, 4));
    }, delay);
  };

  const handleDocUpload = (docId: string) => {
    handleDocProcess(docId, 1800);
  };

  const goNext = () => {
    const idx = stepOrder.indexOf(step);
    if (idx < stepOrder.length - 1) setStep(stepOrder[idx + 1]);
  };
  const goPrev = () => {
    const idx = stepOrder.indexOf(step);
    if (idx > 0) setStep(stepOrder[idx - 1]);
  };

  const docsLidos = docs.filter(d => d.status !== 'pendente').length;
  const docsTotal = docs.length;

  if (step === 'concluida') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 max-w-lg text-center w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-emerald-700 mb-2">Admissão Concluída!</h2>
          <p className="text-gray-600 mb-1"><strong>{form.nomeCompleto || 'Colaborador'}</strong> foi admitido(a) com sucesso.</p>
          <p className="text-sm text-gray-500 mb-4">Matrícula gerada automaticamente · Pasta digital criada</p>
          
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 text-sm text-emerald-800 flex items-start gap-3 text-left">
            <span className="text-lg">📧</span>
            <div>
              <strong>Ficha Completa Enviada (RH e SST)</strong>
              <p className="opacity-90 mt-0.5 text-xs">E-mails disparados automaticamente para o <strong>RH</strong> e para o setor de <strong>Saúde e Segurança (SST)</strong> contendo a ficha de registro completa com todas as informações do colaborador.</p>
            </div>
          </div>

          <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 mb-6 text-left space-y-1.5">
            {[
              ['Cargo', form.cargo], ['Departamento', form.departamento],
              ['Contrato', form.tipoContrato], ['Admissão', form.dataAdmissao],
              ['Salário', `R$ ${form.salario}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-800">{v || '—'}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-3 mb-6">
            <button onClick={() => setFichaModal('sign')} className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md">
              ✍️ Assinar Ficha Digitalmente
            </button>
            <button onClick={() => setFichaModal('print')} className="w-full border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              🖨️ Imprimir Ficha de Registro
            </button>
          </div>

          <div className="flex gap-3 justify-center pt-4 border-t border-gray-100">
            <button onClick={() => { setStep('docs'); setForm(emptyForm); setDocs(docTemplates); setNotifications([]); }}
              className="bg-navy-900 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">
              Nova Admissão
            </button>
          </div>
        </div>

        {/* Ficha de Registro Modals */}
        {fichaModal === 'print' && (
          <div className="fixed inset-0 bg-white z-[60] overflow-y-auto print:bg-white print:static">
            <div className="max-w-4xl mx-auto p-8 print:p-0 text-left">
              <div className="flex justify-between items-center mb-8 print:hidden">
                <h2 className="text-xl font-bold">Ficha de Registro de Empregado</h2>
                <button onClick={() => setFichaModal(null)} className="px-4 py-2 border rounded-xl font-semibold">Fechar</button>
              </div>

              <div className="border border-black p-8 text-sm">
                <div className="text-center border-b border-black pb-4 mb-6">
                  <h1 className="text-2xl font-bold uppercase">Ficha de Registro de Empregado</h1>
                  <p className="text-sm">Empresa Demo S.A.</p>
                </div>
                
                <h3 className="font-bold bg-gray-100 p-1 border-y border-black uppercase text-xs mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div><strong>Nome:</strong> {form.nomeCompleto}</div>
                  <div><strong>Nascimento:</strong> {form.dataNascimento ? new Date(form.dataNascimento).toLocaleDateString('pt-BR') : ''}</div>
                  <div><strong>CPF:</strong> {form.cpf}</div>
                  <div><strong>RG:</strong> {form.rg}</div>
                  <div><strong>Nome da Mãe:</strong> {form.nomeMae}</div>
                  <div><strong>Nome do Pai:</strong> {form.nomePai}</div>
                </div>

                <h3 className="font-bold bg-gray-100 p-1 border-y border-black uppercase text-xs mb-4">Endereço</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2"><strong>Logradouro:</strong> {form.logradouro}, {form.numero} {form.complemento}</div>
                  <div><strong>Bairro:</strong> {form.bairro}</div>
                  <div><strong>Cidade/UF:</strong> {form.cidade} / {form.estado}</div>
                  <div><strong>CEP:</strong> {form.cep}</div>
                </div>

                <h3 className="font-bold bg-gray-100 p-1 border-y border-black uppercase text-xs mb-4">Dados Contratuais</h3>
                <div className="grid grid-cols-2 gap-4 mb-12">
                  <div><strong>Cargo:</strong> {form.cargo}</div>
                  <div><strong>Departamento:</strong> {form.departamento}</div>
                  <div><strong>Data de Admissão:</strong> {form.dataAdmissao ? new Date(form.dataAdmissao).toLocaleDateString('pt-BR') : ''}</div>
                  <div><strong>Salário:</strong> R$ {form.salario}</div>
                  <div><strong>Carga Horária:</strong> {form.cargaHoraria}h /semana</div>
                  <div><strong>Tipo:</strong> {form.tipoContrato}</div>
                </div>

                <div className="flex justify-around pt-12 mt-12">
                  <div className="text-center w-64">
                    <div className="border-t border-black pt-2 text-xs">Assinatura da Empresa</div>
                  </div>
                  <div className="text-center w-64">
                    <div className="border-t border-black pt-2 text-xs">Assinatura do Empregado</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center print:hidden">
                <button onClick={() => window.print()} className="bg-navy-900 text-white px-6 py-2.5 rounded-xl font-semibold">Imprimir Ficha</button>
              </div>
            </div>
          </div>
        )}

        {fichaModal === 'sign' && (
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-navy-900">Assinatura Digital (ICP-Brasil)</h3>
                <button onClick={() => setFichaModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">
                  🔐
                </div>
                <h4 className="text-lg font-bold text-navy-900">Ficha de Registro</h4>
                <p className="text-sm text-gray-500">
                  Um link de assinatura via WhatsApp/E-mail foi enviado para o colaborador <strong>{form.nomeCompleto}</strong> para assinar a Ficha de Registro com validade jurídica.
                </p>
                <div className="pt-6">
                  <button onClick={() => setFichaModal(null)} className="w-full bg-navy-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors shadow-md">
                    Entendi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Admissão de Colaborador</h1>
        <p className="text-sm text-gray-500 mt-1">Leitura automática de documentos · Preenchimento inteligente · Geração de contrato</p>
      </div>

      {/* Notificações Toasts (mock) */}
      <div className="fixed bottom-6 right-6 space-y-2 z-50 pointer-events-none">
        {notifications.map((msg, i) => (
          <div key={i} className="bg-navy-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-3 animate-in slide-in-from-right fade-in">
            <span className="text-emerald-400">✓</span> {msg}
          </div>
        ))}
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-0">
          {steps.map((s, i) => {
            const idx = stepOrder.indexOf(step);
            const sIdx = stepOrder.indexOf(s.id);
            const done = sIdx < idx;
            const active = s.id === step;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => done && setStep(s.id)}
                  className={`flex flex-col items-center gap-1 flex-1 ${done ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    done ? 'bg-emerald-500 text-white' : active ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {done ? '✓' : s.icon}
                  </div>
                  <span className={`text-xs font-medium hidden md:block ${active ? 'text-navy-900' : done ? 'text-emerald-600' : 'text-gray-400'}`}>{s.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 rounded-full ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP: DOCUMENTOS ── */}
      {step === 'docs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy-900">Documentos e Fotos</h2>
            <span className="text-sm text-gray-500">{docsLidos}/{docsTotal} documentos processados</span>
          </div>
          <div className="bg-navy-50 border border-navy-200 rounded-xl p-3 text-sm text-navy-800 flex gap-2">
            <span>🤖</span>
            <span>O sistema lê os dados automaticamente e <strong>salva o arquivo original direto de forma segura na Nuvem (Drive Corporativo)</strong>. Você pode fazer upload, escanear ou usar a câmera.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map(doc => (
              <div key={doc.id} className={`bg-white rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                doc.status === 'lido' ? 'border-emerald-300' : 'border-gray-200'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    doc.status === 'lido' ? 'bg-emerald-100' : 'bg-gray-100'
                  }`}>
                    {doc.status === 'lido' ? '✅' : (doc.tipo === 'foto' ? '📸' : '📄')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800">{doc.label}</div>
                    {doc.status === 'pendente' ? (
                      <div className="text-xs text-gray-400 mt-1">Pendente</div>
                    ) : (
                      <div className="text-xs mt-1 space-y-1">
                        <div className="text-emerald-600 font-medium">✓ OK ({Object.keys(doc.extractedData || {}).length} dados)</div>
                        <div className="text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1 w-max text-[10px] uppercase tracking-wide">
                          <span>☁️</span> Salvo na Nuvem
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações de captura de documento */}
                {readingDoc === doc.id ? (
                  <div className="flex justify-center py-2 text-sm text-navy-600 font-medium animate-pulse">
                    ⚙️ Processando...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <input
                      type="file"
                      ref={el => fileRefs.current[doc.id] = el}
                      className="hidden"
                      onChange={() => handleDocUpload(doc.id)}
                      accept="image/*,.pdf"
                    />
                    
                    {doc.tipo === 'foto' ? (
                      <>
                        <button onClick={() => fileRefs.current[doc.id]?.click()} className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors">
                          📤 Upload
                        </button>
                        <button onClick={() => setCameraModal(doc.id)} className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-2 bg-navy-50 hover:bg-navy-100 text-navy-700 rounded-lg border border-navy-200 transition-colors">
                          📷 Câmera
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => fileRefs.current[doc.id]?.click()} className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors">
                          📤 Arquivo
                        </button>
                        <button onClick={() => setScannerModal(doc.id)} className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-2 bg-navy-50 hover:bg-navy-100 text-navy-700 rounded-lg border border-navy-200 transition-colors">
                          🖨️ Escanear
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={goNext} disabled={docsLidos === 0} className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ${docsLidos > 0 ? 'bg-navy-900 text-white hover:bg-navy-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              Avançar →
            </button>
          </div>
        </div>
      )}

      {/* Câmera Modal */}
      {cameraModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col items-center p-4 relative">
            <button onClick={() => setCameraModal(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 font-bold hover:bg-gray-300">✕</button>
            <h3 className="font-bold text-lg mb-4 text-navy-900">Tirar Foto 3x4</h3>
            <div className="w-full aspect-[3/4] bg-gray-900 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 aspect-[3/4] border-2 border-white/50 border-dashed rounded-[30%] shadow-[0_0_0_999px_rgba(0,0,0,0.5)] pointer-events-none"></div>
              <span className="text-white/50 text-sm">Câmera Ativa...</span>
            </div>
            <button onClick={() => handleDocProcess(cameraModal, 800)} className="w-16 h-16 bg-white border-4 border-navy-900 rounded-full flex items-center justify-center mb-2 hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-navy-900 rounded-full"></div>
            </button>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Capturar</span>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {scannerModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden p-8 text-center relative shadow-2xl">
            <button onClick={() => setScannerModal(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 font-bold">✕</button>
            <div className="text-6xl mb-4">🖨️</div>
            <h3 className="font-bold text-xl mb-2 text-navy-900">Escanear Documento</h3>
            <p className="text-sm text-gray-500 mb-6">Insira o documento no scanner e inicie a digitalização direta.</p>
            <button onClick={() => handleDocProcess(scannerModal, 2500)} className="w-full bg-navy-900 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:bg-navy-800 flex justify-center items-center gap-2">
              <span>🟢</span> Iniciar Digitalização
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: DADOS PESSOAIS ── */}
      {step === 'pessoal' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-navy-900">Dados Pessoais & Contato</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { label: 'Nome Completo *', key: 'nomeCompleto', full: true },
                { label: 'Data de Nascimento *', key: 'dataNascimento', type: 'date' },
                { label: 'CPF *', key: 'cpf', placeholder: '000.000.000-00' },
                { label: 'RG *', key: 'rg' },
                { label: 'Órgão Emissor', key: 'orgaoEmissor' },
                { label: 'Nome da Mãe', key: 'nomeMae', full: true },
                { label: 'Nome do Pai', key: 'nomePai', full: true },
                { label: 'E-mail Pessoal', key: 'email', full: true, type: 'email' },
                { label: 'Telefone Celular *', key: 'telefone', placeholder: '(00) 00000-0000' },
              ] as { label: string; key: keyof AdmissionForm; full?: boolean; type?: string; placeholder?: string }[]).map(f => (
                <div key={f.key} className={f.full ? 'md:col-span-2' : ''}>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                  <input type={f.type || 'text'} value={form[f.key]} onChange={e => upd(f.key, e.target.value)} placeholder={f.placeholder}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all ${form[f.key] ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 focus:border-navy-600'}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={goPrev} className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">← Voltar</button>
            <button onClick={goNext} className="bg-navy-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">Avançar →</button>
          </div>
        </div>
      )}

      {/* ── STEP: DADOS PROFISSIONAIS ── */}
      {step === 'profissional' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-navy-900">Dados Profissionais (Contrato)</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { label: 'Cargo *', key: 'cargo' },
                { label: 'Departamento *', key: 'departamento' },
                { label: 'Salário Base (R$) *', key: 'salario', placeholder: '0.000,00' },
                { label: 'Data de Admissão *', key: 'dataAdmissao', type: 'date' },
                { label: 'Tipo de Contrato', key: 'tipoContrato' },
                { label: 'Carga Horária Semanal', key: 'cargaHoraria' },
              ] as { label: string; key: keyof AdmissionForm; type?: string; placeholder?: string }[]).map(f =>
                f.key === 'tipoContrato' ? (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                    <select value={form.tipoContrato} onChange={e => upd('tipoContrato', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600">
                      <option value="CLT">CLT (Efetivo)</option>
                      <option value="PJ">PJ (Pessoa Jurídica)</option>
                      <option value="Estagio">Estágio</option>
                      <option value="JovemAprendiz">Jovem Aprendiz</option>
                    </select>
                  </div>
                ) : (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                    <input type={f.type || 'text'} value={form[f.key]} onChange={e => upd(f.key, e.target.value)} placeholder={f.placeholder}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all ${form[f.key] ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 focus:border-navy-600'}`} />
                  </div>
                )
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={goPrev} className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">← Voltar</button>
            <button onClick={goNext} className="bg-navy-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">Avançar →</button>
          </div>
        </div>
      )}

      {/* ── STEP: BANCÁRIO ── */}
      {step === 'bancario' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-navy-900">Dados Bancários (Para Pagamento)</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { label: 'Banco *', key: 'banco', placeholder: 'Ex: Itaú, Bradesco, Nubank...' },
                { label: 'Tipo de Conta', key: 'tipoConta' },
                { label: 'Agência *', key: 'agencia', placeholder: '0000' },
                { label: 'Conta *', key: 'conta', placeholder: '00000-0' },
                { label: 'Chave PIX', key: 'pix', full: true, placeholder: 'CPF, e-mail ou telefone' },
              ] as { label: string; key: keyof AdmissionForm; full?: boolean; placeholder?: string }[]).map(f =>
                f.key === 'tipoConta' ? (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                    <select value={form.tipoConta} onChange={e => upd('tipoConta', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600">
                      <option value="corrente">Conta Corrente</option>
                      <option value="poupanca">Conta Poupança</option>
                    </select>
                  </div>
                ) : (
                  <div key={f.key} className={f.full ? 'md:col-span-2' : ''}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                    <input value={form[f.key]} onChange={e => upd(f.key, e.target.value)} placeholder={f.placeholder}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all ${form[f.key] ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 focus:border-navy-600'}`} />
                  </div>
                )
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={goPrev} className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">← Voltar</button>
            <button onClick={goNext} className="bg-navy-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">Revisar →</button>
          </div>
        </div>
      )}

      {/* ── STEP: REVISÃO ── */}
      {step === 'revisao' && (
        <div className="space-y-5">
          <h2 className="font-semibold text-navy-900">Revisão Final</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: '👤 Dados Pessoais', fields: [['Nome', form.nomeCompleto], ['CPF', form.cpf], ['RG', form.rg], ['Nascimento', form.dataNascimento], ['E-mail', form.email], ['Telefone', form.telefone]] },
              { title: '🏠 Endereço', fields: [['CEP', form.cep], ['Logradouro', `${form.logradouro}, ${form.numero}`], ['Bairro', form.bairro], ['Cidade/Estado', `${form.cidade}/${form.estado}`]] },
              { title: '💼 Dados Profissionais', fields: [['Cargo', form.cargo], ['Departamento', form.departamento], ['Contrato', form.tipoContrato], ['Salário', form.salario ? `R$ ${form.salario}` : ''], ['Admissão', form.dataAdmissao], ['Carga Horária', `${form.cargaHoraria}h/semana`]] },
              { title: '🏦 Dados Bancários', fields: [['Banco', form.banco], ['Conta', `Ag. ${form.agencia} · CC ${form.conta}`], ['Tipo', form.tipoConta], ['PIX', form.pix]] },
            ].map(section => (
              <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-navy-900 mb-3 text-sm">{section.title}</h3>
                <div className="space-y-2">
                  {section.fields.map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500 text-xs">{k}</span>
                      <span className={`text-xs font-medium ${v ? 'text-gray-800' : 'text-gray-300'}`}>{v || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-navy-900 mb-3 text-sm">📄 Documentos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {docs.map(d => (
                <div key={d.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${d.status !== 'pendente' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
                  <span>{d.status !== 'pendente' ? '✓' : '○'}</span>{d.label}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={goPrev} className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">← Voltar</button>
            <button onClick={goNext} className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md">
              ✓ Enviar para Aprovação
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: APROVAÇÃO ── */}
      {step === 'aprovacao' && (
        <div className="space-y-5">
          <h2 className="font-semibold text-navy-900">Aprovação da Diretoria</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-4">⏳</div>
            <h3 className="text-xl font-bold text-navy-900 mb-2">Aguardando Aprovação</h3>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Uma notificação foi enviada para o Diretor responsável. Assim que a admissão de <strong>{form.nomeCompleto || 'Colaborador'}</strong> for aprovada, a ficha completa com todas as informações registradas será enviada automaticamente por e-mail ao <strong>RH</strong> e ao <strong>setor de SST</strong> para o agendamento do exame admissional.
            </p>
            
            <div className="bg-amber-50 border border-amber-100 text-amber-700 p-4 rounded-xl text-sm text-left flex items-start gap-3 mb-8">
              <span className="text-xl">🔔</span>
              <div>
                <strong>Status atual:</strong> Pendente de aprovação pela diretoria.
                <div className="mt-1 opacity-80 text-xs">O processo está pausado nesta etapa até a validação.</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={goPrev} className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                ← Revisar Dados
              </button>
              {/* Simulando a aprovação do diretor e finalizando pelo RH */}
              <button onClick={goNext} className="bg-navy-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors shadow-md">
                Simular Aprovação (Testar) →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}