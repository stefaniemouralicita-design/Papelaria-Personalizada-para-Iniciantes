import React, { useState, useRef, useEffect } from 'react';
import { RAW_SALES_PAGE_HTML } from './rawHtml';
import { 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  Monitor, 
  ExternalLink, 
  FileCode2, 
  HelpCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'guide'>('preview');
  const [copied, setCopied] = useState(false);
  const [customMockupUrl, setCustomMockupUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kcc_custom_mockup');
    if (saved) {
      setCustomMockupUrl(saved);
    }
  }, []);

  const getEffectiveHtml = () => {
    if (!customMockupUrl) {
      return RAW_SALES_PAGE_HTML;
    }
    return RAW_SALES_PAGE_HTML.replace(
      /src="\/assets\/images\/mockup_principal\.(png|jpg)"/g,
      `src="${customMockupUrl}"`
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEffectiveHtml());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([getEffectiveHtml()], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pagina-de-vendas-kit-comeco-certo.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um arquivo de imagem (PNG, JPG, WEBP).');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setCustomMockupUrl(dataUrl);
      localStorage.setItem('kcc_custom_mockup', dataUrl);

      try {
        await fetch('/api/upload-mockup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl })
        });
      } catch (err) {
        console.warn('Servidor local não persistiu, mas mantendo via storage:', err);
      }

      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleResetMockup = () => {
    setCustomMockupUrl('');
    localStorage.removeItem('kcc_custom_mockup');
  };

  return (
    <div className="min-h-screen bg-[#151622] text-[#F7F8FF] flex flex-col font-sans">
      {/* INPUT ESCONDIDO DE ARQUIVO */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* HEADER SUPERIOR DE CONTROLE */}
      <header className="border-b border-[#2C2E47] bg-[#1B1C2C] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#5B7CFA] flex items-center justify-center text-white font-bold shadow-md shadow-[#5B7CFA]/20">
              KCC
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight flex items-center gap-2">
                Página de Vendas: Kit Começo Certo
                <span className="text-[10px] bg-[#A78BFA]/20 text-[#A78BFA] px-2 py-0.5 rounded-full border border-[#A78BFA]/30 font-semibold">
                  Azul + Lilás
                </span>
                {customMockupUrl && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Mockup Exato Ativo
                  </span>
                )}
              </h1>
              <p className="text-xs text-[#9FA3C4]">
                Infoproduto Low Ticket (R$ 12,90) • 100% Offline & Mobile-First
              </p>
            </div>
          </div>

          {/* ABAS */}
          <div className="flex items-center bg-[#24263C] p-1 rounded-lg border border-[#333654]">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-[#5B7CFA] text-white shadow-sm'
                  : 'text-[#9FA3C4] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Visualizar Página
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-[#5B7CFA] text-white shadow-sm'
                  : 'text-[#9FA3C4] hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Checklist & Copy
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-[#5B7CFA] text-white shadow-sm'
                  : 'text-[#9FA3C4] hover:text-white'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              Código HTML
            </button>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-[#25263A] hover:bg-[#31334E] text-[#A78BFA] hover:text-white rounded-md text-xs font-semibold flex items-center gap-1.5 border border-[#3B3E60] transition-colors"
              title="Carregar o arquivo exato da imagem enviada"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Carregando...' : 'Subir Imagem do Mockup'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#25263A] hover:bg-[#31334E] text-white rounded-md text-xs font-medium flex items-center gap-1.5 border border-[#3B3E60] transition-colors"
              title="Copiar código HTML completo"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Copiar HTML</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-[#5B7CFA] hover:bg-[#4669EA] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-[#5B7CFA]/30 transition-colors"
              title="Baixar arquivo HTML pronto para subir em hospedagem"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .html</span>
            </button>
          </div>
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col p-4 md:p-6 items-center justify-center">
        {activeTab === 'preview' && (
          <div className="w-full flex flex-col items-center">
            
            {/* BANNER DE CONTROLE DO MOCKUP EXATO */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full max-w-2xl mb-4 px-4 py-3 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDragging
                  ? 'bg-[#5B7CFA]/20 border-[#5B7CFA] scale-[1.01]'
                  : customMockupUrl
                  ? 'bg-[#1D2034] border-emerald-500/40'
                  : 'bg-[#1D2034] border-[#2E314F]'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-[#262842] border border-[#393C62] flex items-center justify-center shrink-0 text-[#A78BFA]">
                  {uploadSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {customMockupUrl ? '✅ Mockup exato ativo na página!' : '📸 Aplicar imagem exata do ChatGPT'}
                    <span className="text-[10px] bg-[#5B7CFA]/20 text-[#8DA6FC] px-1.5 py-0.5 rounded font-normal">
                      PNG / JPG
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#A1A5C4] leading-tight mt-0.5">
                    {customMockupUrl 
                      ? 'O arquivo de imagem exato está aplicado na página e no download.'
                      : 'Clique no botão ao lado para selecionar o arquivo "ChatGPT Image..." do seu computador ou arraste para cá.'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-[#5B7CFA] hover:bg-[#4669EA] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {customMockupUrl ? 'Trocar Imagem' : 'Selecionar Arquivo'}
                </button>
                {customMockupUrl && (
                  <button
                    type="button"
                    onClick={handleResetMockup}
                    className="p-1.5 bg-[#25263A] hover:bg-[#32344E] text-[#9FA3C4] hover:text-white rounded-lg text-xs transition-colors"
                    title="Restaurar imagem padrão"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* TOGGLE MODO DE VISUALIZAÇÃO */}
            <div className="mb-4 flex items-center gap-3 bg-[#1B1C2C] px-3 py-1.5 rounded-full border border-[#2F324E]">
              <span className="text-xs text-[#9FA3C4] font-medium">Visualização:</span>
              <button
                onClick={() => setViewMode('mobile')}
                className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-[#5B7CFA] text-white shadow-sm'
                    : 'text-[#9FA3C4] hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                Mobile (420px)
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-[#5B7CFA] text-white shadow-sm'
                    : 'text-[#9FA3C4] hover:text-white'
                }`}
              >
                <Monitor className="w-3 h-3" />
                Computador
              </button>
              <a
                href="/pagina-de-vendas.html"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#A78BFA] hover:text-white flex items-center gap-1 ml-2 font-semibold transition-colors"
              >
                Abrir sozinho <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* IFRAME COM PREVIEW */}
            <div
              className={`transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border-4 ${
                viewMode === 'mobile'
                  ? 'w-[420px] max-w-full h-[760px] border-[#2C2E47]'
                  : 'w-full max-w-4xl h-[780px] border-[#2C2E47]'
              }`}
            >
              <iframe
                srcDoc={getEffectiveHtml()}
                title="Página de Vendas Preview"
                className="w-full h-full bg-[#F7F8FF] border-none"
              />
            </div>
            
            <p className="text-xs text-[#8C90B3] mt-3 text-center">
              💡 Dica: O arquivo é 100% autossuficiente com CSS inline e abre em qualquer navegador sem internet.
            </p>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="w-full max-w-3xl bg-[#1B1C2C] border border-[#2E314F] rounded-xl p-6 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                Diretrizes de Copywriting e Lançamento
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Checklist de Substituição e Decisões de Copy
              </h2>
            </div>

            {/* CHECKLIST ANTES DE PUBLICAR */}
            <div className="bg-[#24263C] border border-[#353859] rounded-lg p-4">
              <h3 className="text-sm font-bold text-[#F7F8FF] flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-[#5B7CFA]" />
                O que você precisa trocar antes de subir para tráfego:
              </h3>
              <ul className="space-y-2.5 text-xs text-[#C5C9E6]">
                <li className="flex items-start gap-2">
                  <span className="bg-[#5B7CFA] text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">1</span>
                  <span><strong>Link do Checkout:</strong> Trocar <code>href="#Confira"</code> em todos os 5 botões (botões 1, 2, 3, 4 e barra fixa) pelo link da sua plataforma de pagamento (Kiwify, Hotmart, Eduzz, etc.).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#5B7CFA] text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">2</span>
                  <span><strong>Imagens e Mockups:</strong> Substituir as caixas com <code>[MOCKUP: ...]</code> pelas imagens finais do produto e fotos das folhas impressas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#5B7CFA] text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">3</span>
                  <span><strong>Depoimentos e Prints:</strong> Substituir os placeholders <code>[Nome da Aluna / Cidade]</code> e a caixa de prints pelos seus depoimentos reais assim que obtiver as primeiras alunas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#5B7CFA] text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">4</span>
                  <span><strong>Nome e Credenciais da Autora:</strong> Atualizar a seção 10 com seu nome ou o nome do seu ateliê e uma foto sua na bancada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#5B7CFA] text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">5</span>
                  <span><strong>Rodapé Legal:</strong> Preencher o CNPJ, razão social e e-mail de suporte no Bloco 13.</span>
                </li>
              </ul>
            </div>

            {/* HEADLINES ALTERNATIVAS */}
            <div className="border-t border-[#2C2E47] pt-4 space-y-3">
              <h3 className="text-sm font-bold text-white">
                3 Headlines Alternativas Consideradas e Descartadas (e por quê):
              </h3>
              
              <div className="bg-[#202237] p-3 rounded-lg border border-[#2D304E] text-xs space-y-1">
                <p className="font-semibold text-[#A78BFA]">1. "Aprenda a fazer 10 personalizados fáceis e fature até R$ 2.000 trabalhando de casa"</p>
                <p className="text-[#9FA3C4]"><strong>Por que foi descartada:</strong> Promessa de faturamento ("ganhe R$ 2.000") gera ceticismo imediato em tráfego frio para low ticket e bloqueio no Meta Ads. Além disso, a dor da pesquisa não é ganhar rios de dinheiro, é a insegurança de não saber por onde começar e o medo de perder dinheiro com material.</p>
              </div>

              <div className="bg-[#202237] p-3 rounded-lg border border-[#2D304E] text-xs space-y-1">
                <p className="font-semibold text-[#A78BFA]">2. "Super Pacote com mais de 500 moldes e artes prontas no Canva para papelaria"</p>
                <p className="text-[#9FA3C4]"><strong>Por que foi descartada:</strong> A pesquisa de concorrência revelou que o mercado está inundado de bibliotecas de moldes. Oferecer "mais artes" causa sobrecarga de escolha (paralisia por análise) na iniciante, que já está perdida com tantos tutoriais soltos.</p>
              </div>

              <div className="bg-[#202237] p-3 rounded-lg border border-[#2D304E] text-xs space-y-1">
                <p className="font-semibold text-[#A78BFA]">3. "Curso de Papelaria Personalizada para Mães Começarem do Zero"</p>
                <p className="text-[#9FA3C4]"><strong>Por que foi descartada:</strong> A palavra "Curso" remete a esforço, horas de aula e demora para ter resultado. O ticket de R$ 12,90 vende um atalho prático imediato (kit de execução), não uma graduação técnica.</p>
              </div>
            </div>

            {/* RAZÃO DO TEXTO DO BOTÃO */}
            <div className="border-t border-[#2C2E47] pt-4 text-xs text-[#C5C9E6] space-y-2">
              <h3 className="text-sm font-bold text-white">Texto do Botão Escolhido e a Razão:</h3>
              <p className="p-3 bg-[#202237] rounded-lg border border-[#2D304E]">
                <strong>Texto:</strong> <span className="text-[#5B7CFA] font-bold">"QUERO MEU PRIMEIRO PRODUTO POR R$ 12,90"</span><br />
                <strong>Razão:</strong> Combina um verbo de posse em primeira pessoa ("Quero"), o benefício central concreto que combate a paralisia ("Meu Primeiro Produto") e a ancoragem de baixo risco financeiro ("Por R$ 12,90"). Evita termos passivos como "Comprar Agora" ou vagos como "Clique Aqui", reduzindo o atrito do clique no tráfego frio.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="w-full max-w-4xl bg-[#1B1C2C] border border-[#2E314F] rounded-xl p-4 shadow-xl flex flex-col h-[700px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2C2E47]">
              <span className="text-xs text-[#9FA3C4] font-mono">
                pagina-de-vendas.html (arquivo único autossuficiente)
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-[#5B7CFA] hover:bg-[#4669EA] text-white rounded text-xs font-bold flex items-center gap-1 transition-colors shadow-sm shadow-[#5B7CFA]/20"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Todo o Código'}
              </button>
            </div>
            <pre className="flex-1 overflow-auto text-xs font-mono text-[#C5C9E6] bg-[#141522] p-4 rounded-lg border border-[#23253B] leading-relaxed select-all">
              {RAW_SALES_PAGE_HTML}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
