import React, { useEffect, useState, useRef } from 'react';
import {
  Check,
  Database,
  Download,
  Moon,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Store,
  Sun,
  Trash2,
  Upload,
  Image as ImageIcon,
  Palette,
  Smartphone,
  WifiOff,
  FlaskConical,
  Sparkles,
  Share,
  Layers,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePWA } from '../../context/PWAContext';
import { BusinessSegmentType, Settings as SettingsType } from '../../types';
import { exportFullBackup, importFullBackup } from '../../services/database';
import { BUSINESS_SEGMENTS_LIST, getSegmentConfig } from '../../config/businessSegments';

export const SettingsView: React.FC = () => {
  const {
    settings,
    currentSegment,
    changeSegment,
    handleUpdateSettings,
    theme,
    toggleTheme,
    handleResetToDemo,
    handleClearAllData,
    refreshAll,
    setToast,
    setIsSetupWizardOpen,
  } = useApp();

  const {
    isInstalled,
    isOnline,
    hasUpdate,
    updateApp,
    checkForUpdates,
    setIsInstallModalOpen,
    setIsDiagnosticsModalOpen,
    storageInfo,
  } = usePWA();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [notes, setNotes] = useState('');
  const [logo, setLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#ef4444');
  const [secondaryColor, setSecondaryColor] = useState('#fca5a5');
  
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState('5.00');
  const [pixKey, setPixKey] = useState('');
  const [receiptFooterText, setReceiptFooterText] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState('');

  // Segment switching modal state
  const [selectedNewSegment, setSelectedNewSegment] = useState<BusinessSegmentType | null>(null);
  const [importCategories, setImportCategories] = useState(true);
  const [loadDemoData, setLoadDemoData] = useState(false);
  const [isChangingSegment, setIsChangingSegment] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setName(settings.name || '');
      setCategory(settings.category || '');
      setPhone(settings.phone || '');
      setWhatsapp(settings.whatsapp || '');
      setEmail(settings.email || '');
      setAddress(settings.address || '');
      setCity(settings.city || '');
      setState(settings.state || '');
      setNotes(settings.notes || '');
      setLogo(settings.logo || '');
      setPrimaryColor(settings.primaryColor || '#ef4444');
      setSecondaryColor(settings.secondaryColor || '#fca5a5');

      setDefaultDeliveryFee(settings.defaultDeliveryFee?.toString() || '5.00');
      setPixKey(settings.pixKey || '');
      setReceiptFooterText(settings.receiptFooterText || '');
      setWhatsappTemplate(settings.whatsappTemplate || '');
    }
  }, [settings]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 500;

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
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setToast({ message: 'Por favor, selecione uma imagem válida.', type: 'error' });
        return;
      }
      try {
        const compressedBase64 = await compressImage(file);
        setLogo(compressedBase64);
        setToast({ message: 'Logo carregada com sucesso!', type: 'success' });
      } catch (err) {
        setToast({ message: 'Erro ao processar imagem.', type: 'error' });
      }
    }
  };

  const handleRemoveLogo = () => {
    setLogo('');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleConfirmSegmentChange = async () => {
    if (!selectedNewSegment) return;
    try {
      setIsChangingSegment(true);
      await changeSegment(selectedNewSegment, {
        loadSuggestedCategories: importCategories,
        loadDemoData: loadDemoData,
      });
      setSelectedNewSegment(null);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Erro ao alterar segmento.', type: 'error' });
    } finally {
      setIsChangingSegment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updated: SettingsType = {
      id: 'settings',
      segment: currentSegment.id,
      name: name.trim() || 'Meu Negócio',
      category: category.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      notes: notes.trim(),
      logo,
      primaryColor,
      secondaryColor,
      defaultDeliveryFee: Number(defaultDeliveryFee) || 0,
      pixKey: pixKey.trim(),
      receiptFooterText: receiptFooterText.trim(),
      whatsappTemplate: whatsappTemplate.trim(),
      currency: 'BRL',
      theme,
      createdAt: settings?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await handleUpdateSettings(updated);
  };

  const handleExportBackup = async () => {
    try {
      const json = await exportFullBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_gestao_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ message: 'Backup exportado com sucesso!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Falha ao exportar backup.', type: 'error' });
    }
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const success = await importFullBackup(content);
          if (success) {
            await refreshAll();
            setToast({ message: 'Backup importado com sucesso!', type: 'success' });
          } else {
            setToast({ message: 'Arquivo de backup inválido.', type: 'error' });
          }
        } catch (err) {
          setToast({ message: 'Erro ao processar arquivo.', type: 'error' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div id="settings-view" className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
          🏢 Meu Negócio
        </h1>
        <p className="text-xs sm:text-sm text-stone-400">
          Personalize a identidade, contatos e configurações do seu estabelecimento
        </p>
      </div>

      {/* Segment Selector Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="font-heading font-bold text-base text-white">
                Segmento do Negócio
              </h2>
              <p className="text-xs text-stone-400">
                Segmento ativo: <strong className="text-white">{currentSegment.icon} {currentSegment.name}</strong>
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span>{currentSegment.icon}</span>
            <span>{currentSegment.name}</span>
          </span>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          O segmento adapta automaticamente as terminologias, sugestões de produtos, regras de estoque e atalhos do sistema. Ao alterar o segmento, seus dados atuais <strong>não serão apagados</strong>.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
          {BUSINESS_SEGMENTS_LIST.map((seg) => {
            const isSelected = currentSegment.id === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => {
                  if (seg.id !== currentSegment.id) {
                    setSelectedNewSegment(seg.id);
                  }
                }}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-red-600/15 border-red-500 text-white shadow-md shadow-red-600/10 ring-1 ring-red-500'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white'
                }`}
              >
                <span className="text-2xl mb-1.5">{seg.icon}</span>
                <span className="font-bold text-xs text-white leading-tight">
                  {seg.name}
                </span>
                <span className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                  {seg.tagline}
                </span>

                {isSelected && (
                  <span className="absolute top-2 right-2 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-600 text-white">
                    Ativo
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card: Logo e Identidade Visual */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="font-heading font-bold text-base text-white">
              Logomarca
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Store className="w-8 h-8 text-stone-700" />
              )}
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <input 
                type="file" 
                accept="image/*" 
                ref={logoInputRef}
                onChange={handleLogoUpload} 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => logoInputRef.current?.click()}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-colors border border-stone-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Adicionar / Trocar Logo
              </button>
              {logo && (
                <button 
                  type="button" 
                  onClick={handleRemoveLogo}
                  className="px-4 py-2 bg-stone-950 hover:bg-red-950/20 text-red-400 text-xs font-bold rounded-xl transition-colors border border-stone-800 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Remover Logo
                </button>
              )}
              <p className="text-[10px] text-stone-500 mt-1">Imagens serão comprimidas e salvas localmente.</p>
            </div>
          </div>
        </div>

        {/* Card: Dados do Estabelecimento */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
            <Store className="w-5 h-5 text-red-400" />
            <h2 className="font-heading font-bold text-base text-white">
              Identificação & Contatos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Nome do Negócio *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
                placeholder="Ex: Padaria São José"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Categoria / Nicho
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
                placeholder="Ex: Pizzaria, Adega, Sorveteria..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Telefone de Contato
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                WhatsApp Oficial
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 11999998888"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Endereço Completo
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Estado
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Observações / Avisos
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500 h-20"
                placeholder="Ex: Horário de funcionamento, dias fechados, etc."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Taxa de Entrega Padrão (R$)
              </label>
              <input
                type="number"
                step="0.50"
                value={defaultDeliveryFee}
                onChange={(e) => setDefaultDeliveryFee(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Chave Pix para Pagamentos
              </label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CNPJ, Celular, E-mail..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Rodapé do Comprovante (Impressão)
              </label>
              <input
                type="text"
                value={receiptFooterText}
                onChange={(e) => setReceiptFooterText(e.target.value)}
                placeholder="Ex: Agradecemos a preferência! Volte sempre!"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Card: Tema e Cores */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
            <Palette className="w-5 h-5 text-blue-400" />
            <h2 className="font-heading font-bold text-base text-white">
              Cores e Aparência
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Cor Principal (Botões e Destaques)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-stone-950 border-0 p-0"
                />
                <input 
                  type="text" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white flex-1"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Cor Secundária (Detalhes)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={secondaryColor} 
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-stone-950 border-0 p-0"
                />
                <input 
                  type="text" 
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white flex-1"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-stone-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Tema Visual</h3>
              <p className="text-[10px] sm:text-xs text-stone-400">Alterna entre o modo escuro premium e o modo claro</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs border border-stone-700 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <><Sun className="w-4 h-4 text-amber-400" /><span>Modo Claro</span></>
              ) : (
                <><Moon className="w-4 h-4 text-blue-400" /><span>Modo Escuro</span></>
              )}
            </button>
          </div>
        </div>

        {/* Card: Mensagem de WhatsApp */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h2 className="font-heading font-bold text-base text-white">
              Mensagem Automática WhatsApp
            </h2>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">
              Template do Texto (Tags dinâmicas: &#123;cliente&#125;, &#123;numero&#125;, &#123;itens&#125;, &#123;total&#125;, &#123;endereco&#125;, &#123;chavePix&#125;)
            </label>
            <textarea
              rows={4}
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Configurações</span>
        </button>
      </form>

      {/* Card: PWA & Aplicativo Offline */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="font-heading font-bold text-base text-white">
                Aplicativo PWA & Modo Offline
              </h2>
              <p className="text-xs text-stone-400">
                Instale no seu celular ou computador e utilize 100% offline sem gastar dados móveis
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isInstalled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-stone-800 text-stone-300 border border-stone-700'
            }`}
          >
            {isInstalled ? 'App Instalado' : 'Pronto para Instalar'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-red-600/15 hover:bg-red-600/25 text-red-300 font-bold text-xs border border-red-500/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-red-400" />
            <span>Instalar Aplicativo (Android / iOS / PC)</span>
          </button>

          <button
            onClick={() => setIsDiagnosticsModalOpen(true)}
            className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-stone-950 hover:bg-stone-850 text-stone-200 font-bold text-xs border border-stone-800 transition-colors cursor-pointer"
          >
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <span>Central de Testes PWA & Offline</span>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-stone-200 flex items-center gap-2">
              <span>Status do Sistema:</span>
              <span className="text-emerald-400 font-mono">v2.0 PWA Offline-First</span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Ícone ativo: {settings?.logo ? 'Logo do seu negócio' : 'Logo padrão AL Studio'}
            </p>
          </div>

          <button
            onClick={async () => {
              setToast({ message: 'Buscando atualizações de versão...', type: 'info' });
              const found = await checkForUpdates();
              if (!found) {
                setToast({ message: 'Você já está usando a versão mais recente do app!', type: 'success' });
              }
            }}
            className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-semibold text-xs border border-stone-700/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Verificar Atualizações</span>
          </button>
        </div>
      </div>

      {/* Card: Assistente de Configuração Inicial */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="font-heading font-bold text-base text-white">
                Assistente de Configuração Inicial
              </h2>
              <p className="text-xs text-stone-400">
                Execute novamente o passo a passo de primeiro acesso para cadastrar seu negócio, produtos, estoque e primeira venda.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-stone-950 border border-stone-800">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-white">Passo a Passo de Boas-Vindas</p>
            <p className="text-[11px] text-stone-400">
              Personalize nome, logo, estoque inicial ou experimente com dados fictícios de demonstração.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSetupWizardOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Abrir Assistente Inicial</span>
          </button>
        </div>
      </div>

      {/* Card: Backup e Gerenciamento de Dados */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
          <Database className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="font-heading font-bold text-base text-white">
              Armazenamento Local & Backup
            </h2>
            <p className="text-xs text-stone-400">
              Seus dados estão seguros e gravados exclusivamente neste dispositivo (Offline-first)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-stone-950 hover:bg-stone-850 text-stone-200 font-bold text-xs border border-stone-800 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Baixar Backup (JSON)</span>
          </button>

          <button
            onClick={handleImportBackup}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-stone-950 hover:bg-stone-850 text-stone-200 font-bold text-xs border border-stone-800 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Restaurar Backup</span>
          </button>

          <button
            onClick={handleResetToDemo}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-stone-950 hover:bg-amber-950/20 text-amber-300 font-bold text-xs border border-stone-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Carregar Dados de Exemplo</span>
          </button>

          <button
            onClick={handleClearAllData}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-stone-950 hover:bg-red-950/30 text-red-400 font-bold text-xs border border-stone-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Zerar Todos os Dados</span>
          </button>
        </div>
      </div>

      {/* System Footer info */}
      <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800/60 text-center text-xs text-stone-500 space-y-1">
        <div className="font-bold text-stone-400">{settings?.name || 'Meu Negócio'} - {settings?.category || 'Gestão Local'}</div>
        <div>AL Studio Gestão • Versão 2.0.0 Multi-Segmento PWA Offline-First</div>
        <div className="text-[11px] text-stone-600">
          Dados processados integralmente no seu dispositivo.
        </div>
      </div>

      {/* Confirmation Modal for Segment Change */}
      {selectedNewSegment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-lg text-white">
                  Alterar Segmento do Negócio
                </h3>
              </div>
              <button
                onClick={() => setSelectedNewSegment(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center gap-3">
                <span className="text-3xl">{getSegmentConfig(selectedNewSegment).icon}</span>
                <div>
                  <div className="text-xs text-stone-400">Novo segmento selecionado:</div>
                  <div className="font-extrabold text-base text-white">
                    {getSegmentConfig(selectedNewSegment).name}
                  </div>
                  <div className="text-xs text-stone-400">
                    {getSegmentConfig(selectedNewSegment).tagline}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                <strong>Atenção:</strong> Alterar o segmento modificará as terminologias, categorias recomendadas e configurações de exibição. <strong>Seus produtos, vendas, clientes, estoque e histórico financeiro existentes NÃO serão apagados.</strong>
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importCategories}
                    onChange={(e) => setImportCategories(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-700 bg-stone-950 text-red-600 focus:ring-red-500"
                  />
                  <span>Importar categorias recomendadas para {getSegmentConfig(selectedNewSegment).name}</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loadDemoData}
                    onChange={(e) => setLoadDemoData(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-700 bg-stone-950 text-red-600 focus:ring-red-500"
                  />
                  <span>Carregar produtos e estoque de demonstração deste segmento</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setSelectedNewSegment(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSegmentChange}
                disabled={isChangingSegment}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isChangingSegment && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Continuar & Alterar Segmento</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
