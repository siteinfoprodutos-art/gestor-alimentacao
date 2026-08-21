import React, { useRef, useState } from 'react';
import { Upload, Trash2, Store, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

interface Step2LogoProps {
  logo: string;
  setLogo: (val: string) => void;
  businessName: string;
  category: string;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Logo: React.FC<Step2LogoProps> = ({
  logo,
  setLogo,
  businessName,
  category,
  onNext,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const compressAndSetImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 400;

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setLogo(dataUrl);
        setIsProcessing(false);
      };
      img.onerror = () => setIsProcessing(false);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => setIsProcessing(false);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      compressAndSetImage(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      compressAndSetImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="onboarding-step-2" className="space-y-6 animate-fade-in">
      {/* Step Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
          <span>Passo 2 de 5</span>
          <span className="text-stone-600">•</span>
          <span>Identidade Visual</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Adicione a Logo do seu Estabelecimento
        </h2>
        <p className="text-sm text-stone-400">
          Sua logo aparecerá no topo do sistema, nos comprovantes de impressão térmicos e no ícone do aplicativo PWA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left / Upload Area */}
        <div className="md:col-span-7 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
              isDragging
                ? 'border-red-500 bg-red-500/10 scale-[1.01]'
                : logo
                ? 'border-stone-700 bg-stone-900/60 hover:border-red-500/50'
                : 'border-stone-800 bg-stone-900/40 hover:border-red-500/60 hover:bg-stone-900'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-stone-300">Processando imagem...</span>
              </div>
            ) : logo ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-red-500/40 shadow-xl bg-stone-950 p-1">
                  <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" /> Logo carregada com sucesso!
                  </p>
                  <p className="text-[11px] text-stone-500">Clique para alterar ou selecione outro arquivo</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-800 text-stone-400 flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-stone-200">
                    Clique para enviar ou arraste a imagem aqui
                  </p>
                  <p className="text-xs text-stone-500">
                    Formatos recomendados: PNG, JPG, WebP (quadrada)
                  </p>
                </div>
              </div>
            )}
          </div>

          {logo && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLogo('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover logo e usar ícone padrão</span>
              </button>
            </div>
          )}
        </div>

        {/* Right / Live Preview Card */}
        <div className="md:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Pré-visualização
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Em tempo real
            </span>
          </div>

          {/* Header Mock */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-md">
            {logo ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex-shrink-0">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Store className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm text-white truncate">
                {businessName.trim() || 'Meu Estabelecimento'}
              </p>
              <p className="text-[11px] text-stone-400 truncate">
                {category || 'Lanchonete / Pizzaria'}
              </p>
            </div>
          </div>

          {/* Receipt Mock */}
          <div className="bg-stone-800/40 border border-stone-800 rounded-2xl p-3.5 space-y-2 text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
              Comprovante de Venda
            </p>
            <div className="w-6 h-6 mx-auto rounded-lg overflow-hidden bg-stone-900 flex items-center justify-center">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-3.5 h-3.5 text-stone-400" />
              )}
            </div>
            <p className="text-xs font-bold text-stone-300">
              {businessName.trim() || 'Nome da Loja'}
            </p>
            <div className="border-t border-dashed border-stone-700 pt-1 text-[10px] text-stone-500">
              Pedido #001 • Pagamento Aprovado
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-800">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-bold text-stone-400 hover:text-white transition-colors"
        >
          Voltar
        </button>

        <div className="flex items-center gap-3">
          {!logo && (
            <button
              type="button"
              onClick={onNext}
              className="px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors"
            >
              Pular / Configurar depois
            </button>
          )}

          <button
            type="button"
            id="btn-step-2-next"
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 cursor-pointer flex items-center gap-2 transition-all"
          >
            <span>Avançar para Produtos</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
