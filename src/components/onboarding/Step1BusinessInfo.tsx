import React from 'react';
import { Store, Tag, Sparkles, Phone, MessageSquare } from 'lucide-react';
import { BUSINESS_CATEGORIES } from './onboardingData';
import { BusinessSegmentType } from '../../types';
import { getSegmentConfig } from '../../config/businessSegments';

interface Step1BusinessInfoProps {
  segment: BusinessSegmentType;
  setSegment: (val: BusinessSegmentType) => void;
  businessName: string;
  setBusinessName: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  slogan: string;
  setSlogan: (val: string) => void;
  whatsapp: string;
  setWhatsapp: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step1BusinessInfo: React.FC<Step1BusinessInfoProps> = ({
  segment,
  setSegment,
  businessName,
  setBusinessName,
  category,
  setCategory,
  slogan,
  setSlogan,
  whatsapp,
  setWhatsapp,
  onNext,
  onBack,
}) => {
  const isFormValid = businessName.trim().length >= 2 && segment;

  const handleSelectSegment = (segId: BusinessSegmentType) => {
    setSegment(segId);
    const segConfig = getSegmentConfig(segId);
    setCategory(segConfig.name);
    
    // If business name is still empty, suggest a friendly name
    if (!businessName.trim() || businessName.includes('Demo') || businessName === 'Meu Estabelecimento') {
      setBusinessName(`${segConfig.name} `);
    }
    if (!slogan.trim()) {
      setSlogan(segConfig.tagline);
    }
  };

  return (
    <div id="onboarding-step-1" className="space-y-6 animate-fade-in">
      {/* Title & Description */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
          <span>Passo 1 de 5</span>
          <span className="text-stone-600">•</span>
          <span>Identificação & Segmento</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Qual é o segmento e nome do seu negócio?
        </h2>
        <p className="text-sm text-stone-400">
          A plataforma adaptará automaticamente a terminologia, estoque, produtos e cores para o seu segmento.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Business Category Selection Grid */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
            Escolha o Segmento do Seu Negócio <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {BUSINESS_CATEGORIES.map((cat) => {
              const isSelected = segment === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectSegment(cat.id)}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                    isSelected
                      ? 'bg-red-600/15 border-red-500 text-white shadow-md shadow-red-600/10 ring-1 ring-red-500'
                      : 'bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white'
                  }`}
                >
                  <span className="text-2xl mb-1.5">{cat.icon}</span>
                  <span className="font-bold text-xs line-clamp-1">{cat.name}</span>
                  <span className="text-[10px] text-stone-500 line-clamp-2 mt-0.5 leading-tight">
                    {cat.description}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
            Nome do Estabelecimento <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
              <Store className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="wizard-business-name-input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Pizzaria Bella Napoli, Lanches do Gaúcho, Adega Prime..."
              autoFocus
              className="w-full pl-11 pr-4 py-3 bg-stone-900 border border-stone-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl text-white placeholder-stone-500 font-medium text-sm transition-all"
            />
          </div>
        </div>

        {/* Optional Info: Slogan & WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
              Slogan / Frase Curta <span className="text-stone-500 font-normal">(Opcional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Ex: O melhor sabor da região!"
                className="w-full pl-10 pr-3 py-2.5 bg-stone-900 border border-stone-800 focus:border-red-500 rounded-xl text-white placeholder-stone-500 text-xs font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
              WhatsApp para Pedidos <span className="text-stone-500 font-normal">(Opcional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <MessageSquare className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full pl-10 pr-3 py-2.5 bg-stone-900 border border-stone-800 focus:border-red-500 rounded-xl text-white placeholder-stone-500 text-xs font-medium transition-all"
              />
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

        <button
          type="button"
          id="btn-step-1-next"
          disabled={!isFormValid}
          onClick={onNext}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            isFormValid
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 cursor-pointer'
              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
          }`}
        >
          <span>Avançar para o Logo</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
