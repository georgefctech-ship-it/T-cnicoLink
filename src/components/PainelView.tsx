import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Trash2, 
  Plus, 
  Eye, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  Smartphone, 
  Share2, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Phone,
  MapPin,
  Briefcase,
  Layers,
  Camera,
  Crown,
  TrendingUp,
  Zap,
  Award,
  Download,
  Loader2,
  Link as LinkIcon,
  Pencil,
  Edit2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { Profile, ServicePhoto, AppView, SystemSettings } from '../types';
import { getSupabase } from '../lib/supabaseClient';
import { 
  getCleanShareUrl, 
  getQrCodeScanUrl, 
  getCleanDisplayUrl,
  getDisplayHost
} from '../lib/profileUrlHelper';
import { PlanUpgradeModal } from './PlanUpgradeModal';
import { DEFAULT_SYSTEM_SETTINGS } from '../lib/mockData';
import { ProfessionSelect } from './ProfessionSelect';
import { compressImage, PRESET_AVATARS } from '../lib/imageHelper';

interface PainelViewProps {
  profile: Profile;
  gallery: ServicePhoto[];
  onSaveProfile: (updatedProfile: Profile) => void;
  onAddPhoto: (photo: ServicePhoto) => void;
  onUpdatePhoto?: (photo: ServicePhoto) => void;
  onDeletePhoto: (photoId: string) => void;
  setCurrentView: (view: AppView) => void;
  isSupabaseConnected: boolean;
  systemSettings?: SystemSettings;
}

export const PainelView: React.FC<PainelViewProps> = ({
  profile,
  gallery,
  onSaveProfile,
  onAddPhoto,
  onUpdatePhoto,
  onDeletePhoto,
  setCurrentView,
  isSupabaseConnected,
  systemSettings = DEFAULT_SYSTEM_SETTINGS,
}) => {
  const [formData, setFormData] = useState<Profile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'views_limit' | 'photos_limit' | 'manual' | 'pro_feature'>('manual');
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile_sim'>('mobile_sim');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoInputMode, setPhotoInputMode] = useState<'file' | 'url'>('file');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const [showPresetAvatars, setShowPresetAvatars] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarSaveSuccess, setAvatarSaveSuccess] = useState(false);
  const [avatarUrlText, setAvatarUrlText] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoTag, setNewPhotoTag] = useState<'Instalação' | 'Antes e Depois' | 'Manutenção' | 'Acabamento'>('Instalação');

  // Photo Editing & Deleting states
  const [editingPhoto, setEditingPhoto] = useState<ServicePhoto | null>(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
  const [editPhotoTag, setEditPhotoTag] = useState<'Instalação' | 'Antes e Depois' | 'Manutenção' | 'Acabamento'>('Instalação');
  const [editPhotoDesc, setEditPhotoDesc] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [photoToDelete, setPhotoToDelete] = useState<ServicePhoto | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sync if profile changes from outside
  React.useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  const isPro = formData.plan === 'pro' || formData.plan === 'enterprise';
  const photoLimit = isPro ? (systemSettings.pro_plan_photo_limit || 30) : (systemSettings.free_plan_photo_limit || 6);
  const monthlyViewsLimit = isPro ? (systemSettings.pro_plan_monthly_views || 2500) : (systemSettings.free_plan_monthly_views || 100);
  const currentViews = formData.views_count || 0;
  const viewsPercent = Math.min(100, Math.round((currentViews / monthlyViewsLimit) * 100));

  // Sync if profile changes from outside
  React.useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  // Phone Mask
  function handleWhatsappChange(value: string) {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;
    if (numbers.length <= 11) {
      if (numbers.length > 2 && numbers.length <= 6) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length > 6) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
    }
    setFormData(prev => ({ ...prev, whatsapp_number: formatted }));
  }

  // Handle Photo Upload (Supabase storage or Local Base64 FileReader for instant offline reliability)
  async function handlePhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (gallery.length >= photoLimit) {
      setUpgradeReason('photos_limit');
      setShowUpgradeModal(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingPhoto(true);
    const file = files[0];

    const supabase = getSupabase();
    let finalImageUrl = '';

    if (supabase && isSupabaseConnected) {
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${formData.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('services-photos')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('services-photos')
            .getPublicUrl(filePath);
          finalImageUrl = publicUrl;
        }
      } catch (err) {
        console.warn('Storage upload fallback to base64', err);
      }
    }

    if (!finalImageUrl) {
      // FileReader fallback with auto compression to prevent QuotaExceededError
      try {
        const compressedDataUrl = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.82,
          mimeType: 'image/jpeg'
        });

        const newPhoto: ServicePhoto = {
          id: 'photo-' + Date.now(),
          profile_id: formData.id,
          image_url: compressedDataUrl,
          title: newPhotoTitle || 'Serviço Executado com Excelência',
          description: newPhotoDesc || 'Trabalho realizado com acabamento de alto padrão e materiais certificados.',
          tag: newPhotoTag,
          created_at: new Date().toISOString(),
        };
        onAddPhoto(newPhoto);
        setNewPhotoTitle('');
        setNewPhotoDesc('');
      } catch (err) {
        console.error('Falha ao otimizar foto:', err);
      } finally {
        setUploadingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

    const newPhoto: ServicePhoto = {
      id: 'photo-' + Date.now(),
      profile_id: formData.id,
      image_url: finalImageUrl,
      title: newPhotoTitle || 'Serviço Executado com Excelência',
      description: newPhotoDesc || 'Trabalho realizado com acabamento de alto padrão e materiais certificados.',
      tag: newPhotoTag,
      created_at: new Date().toISOString(),
    };
    onAddPhoto(newPhoto);
    setNewPhotoTitle('');
    setNewPhotoDesc('');
    setUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Avatar Upload with auto compression and immediate profile save
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploadingAvatar(true);

    try {
      const optimizedAvatar = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        mimeType: 'image/jpeg'
      });

      const updated = { ...formData, avatar_url: optimizedAvatar };
      setFormData(updated);
      onSaveProfile(updated);
      setAvatarSaveSuccess(true);
      setTimeout(() => setAvatarSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Erro ao salvar foto de perfil:', err);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  }

  function handleSetAvatarFromUrl() {
    if (avatarUrlText.trim()) {
      const updated = { ...formData, avatar_url: avatarUrlText.trim() };
      setFormData(updated);
      onSaveProfile(updated);
      setShowAvatarUrlInput(false);
      setAvatarUrlText('');
      setAvatarSaveSuccess(true);
      setTimeout(() => setAvatarSaveSuccess(false), 3500);
    }
  }

  function handleSelectPresetAvatar(url: string) {
    const updated = { ...formData, avatar_url: url };
    setFormData(updated);
    onSaveProfile(updated);
    setShowPresetAvatars(false);
    setAvatarSaveSuccess(true);
    setTimeout(() => setAvatarSaveSuccess(false), 3500);
  }

  // Add Photo by Direct Image URL (Unsplash, Imgur, Drive, etc.)
  function handleAddPhotoByUrl() {
    const url = newPhotoUrl.trim();
    if (!url) return;

    if (gallery.length >= photoLimit) {
      setUpgradeReason('photos_limit');
      setShowUpgradeModal(true);
      return;
    }

    const newPhoto: ServicePhoto = {
      id: 'photo-' + Date.now() + Math.random().toString(36).substring(2, 5),
      profile_id: formData.id,
      image_url: url,
      title: newPhotoTitle.trim() || 'Serviço Executado com Excelência',
      description: newPhotoDesc.trim() || 'Trabalho realizado com acabamento de alto padrão e materiais certificados.',
      tag: newPhotoTag,
      created_at: new Date().toISOString(),
    };

    onAddPhoto(newPhoto);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
    setNewPhotoDesc('');
  }

  // Quick add sample photos
  function handleAddSamplePhoto(sampleUrl: string, sampleTitle: string, tag: any) {
    if (gallery.length >= photoLimit) {
      setUpgradeReason('photos_limit');
      setShowUpgradeModal(true);
      return;
    }
    const newPhoto: ServicePhoto = {
      id: 'photo-' + Date.now() + Math.random().toString(36).substr(2, 4),
      profile_id: formData.id,
      image_url: sampleUrl,
      title: sampleTitle,
      description: 'Execução dentro das normas técnicas vigentes com teste de funcionamento e aprovação do cliente.',
      tag: tag,
      created_at: new Date().toISOString(),
    };
    onAddPhoto(newPhoto);
  }

  function handleStartEditPhoto(photo: ServicePhoto) {
    setEditingPhoto(photo);
    setEditPhotoTitle(photo.title || '');
    setEditPhotoTag((photo.tag as any) || 'Instalação');
    setEditPhotoDesc(photo.description || '');
    setEditPhotoUrl(photo.image_url || '');
  }

  function handleSaveEditPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPhoto) return;
    if (!editPhotoUrl.trim()) return;

    const updated: ServicePhoto = {
      ...editingPhoto,
      title: editPhotoTitle.trim() || 'Serviço Executado',
      tag: editPhotoTag,
      description: editPhotoDesc.trim(),
      image_url: editPhotoUrl.trim(),
    };

    if (onUpdatePhoto) {
      onUpdatePhoto(updated);
    }
    setEditingPhoto(null);
  }

  function handleEditPhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Save and Publish Handler
  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsSaving(true);

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: formData.id,
            full_name: formData.full_name,
            username: formData.username,
            profession: formData.profession,
            whatsapp_number: formData.whatsapp_number,
            city_state: formData.city_state,
            bio_short: formData.bio_short,
            avatar_url: formData.avatar_url,
            years_experience: formData.years_experience,
            accepts_pix: formData.accepts_pix,
            accepts_cards: formData.accepts_cards,
            offers_warranty: formData.offers_warranty,
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.error('Error saving to supabase', err);
      }
    }

    onSaveProfile(formData);
    setIsSaving(false);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#ffffff']
      });
    } catch (e) {
      // Ignore if confetti not loaded
    }

    setShowPublishModal(true);
  }

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const cleanShareUrl = getCleanShareUrl(formData.username);
  const qrScanUrl = getQrCodeScanUrl(formData);
  const cleanShortDisplayUrl = getCleanDisplayUrl(formData.username);

  useEffect(() => {
    if (qrScanUrl) {
      QRCode.toDataURL(qrScanUrl, {
        width: 480,
        margin: 3,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Erro gerando QR Code:', err));
    }
  }, [qrScanUrl]);

  const rawPhone = formData.whatsapp_number.replace(/\D/g, '');
  const cleanPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
  const whatsappDemoLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Olá ${formData.full_name}, vi seu portfólio no TécnicoLink e gostaria de um orçamento!`
  )}`;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] p-4 sm:p-6 lg:p-8">
      
      {/* Top action header */}
      <div className="max-w-7xl mx-auto mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Syne',sans-serif]">
              Painel de Edição do Técnico
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md">
              {formData.plan === 'pro' ? 'Plano PRO' : 'Plano FREE'}
            </span>
            {formData.role === 'admin' && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-orange-600 text-white rounded-md">
                Admin Master
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Atualize suas informações e adicione novas fotos de serviços realizados.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isPro && (
            <button
              type="button"
              onClick={() => {
                setUpgradeReason('manual');
                setShowUpgradeModal(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-lg shadow-xs transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Crown className="w-4 h-4 fill-white" />
              <span>UPGRADE PRO</span>
            </button>
          )}

          {formData.role === 'admin' && (
            <button
              type="button"
              onClick={() => setCurrentView('admin_control')}
              className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold rounded-lg border border-orange-200 shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Central Admin</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCurrentView('public_profile')}
            className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-300 shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-orange-600" />
            <span>Ver Como o Cliente Vê</span>
          </button>

          <button
            type="button"
            id="btn-salvar-publicar"
            onClick={() => handleSave()}
            disabled={isSaving || formData.status === 'suspended'}
            className="flex-1 sm:flex-none px-5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>SALVAR E PUBLICAR</span>
          </button>
        </div>
      </div>

      {/* Suspension Alert Banner if status is suspended */}
      {formData.status === 'suspended' && (
        <div className="max-w-7xl mx-auto mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-red-900 block text-sm">Conta Temporariamente Suspensa pelo Administrador</span>
            <span className="text-red-700">
              O administrador master bloqueou as alterações e o envio de novas fotos para este perfil. Entre em contato com o suporte/administrador para regularizar o acesso.
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Form on Left, Simulator / Details on Right */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Photo Uploader (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Dados do Profissional */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Briefcase className="w-4 h-4 text-orange-600" />
              <span>1. Informações Básicas & Contato</span>
            </h2>

            <div className="space-y-4">
              
              {/* Avatar + Name */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="relative group shrink-0">
                    <img
                      src={formData.avatar_url || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789'}
                      alt="Foto do perfil"
                      className="w-20 h-20 rounded-xl object-cover ring-2 ring-orange-500/50 shadow-sm bg-gray-100"
                    />
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute inset-0 bg-gray-900/75 opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center text-[10px] text-white font-bold transition-opacity cursor-pointer"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mb-0.5 text-orange-400" />
                          Trocar Foto
                        </>
                      )}
                    </button>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{isUploadingAvatar ? 'Otimizando...' : 'Enviar Foto'}</span>
                  </button>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                      Nome Completo ou Nome Fantasia <span className="text-orange-600">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPresetAvatars(!showPresetAvatars);
                          setShowAvatarUrlInput(false);
                        }}
                        className="text-[11px] text-gray-600 hover:text-orange-600 font-semibold flex items-center gap-1 bg-gray-100 hover:bg-orange-50 px-2 py-0.5 rounded transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-orange-500" />
                        <span>Avatares Prontos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAvatarUrlInput(!showAvatarUrlInput);
                          setShowPresetAvatars(false);
                        }}
                        className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>{showAvatarUrlInput ? 'Fechar' : 'Via Link'}</span>
                      </button>
                    </div>
                  </div>

                  {avatarSaveSuccess && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Foto do perfil salva e sincronizada com sucesso!</span>
                    </div>
                  )}

                  {showPresetAvatars && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                      <p className="text-[11px] font-bold text-gray-600">Escolha um avatar profissional com 1 clique:</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {PRESET_AVATARS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectPresetAvatar(preset.url)}
                            className="group relative flex flex-col items-center gap-1 p-1 bg-white border border-gray-200 hover:border-orange-500 rounded-lg transition-all"
                          >
                            <img src={preset.url} alt={preset.name} className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition-transform" />
                            <span className="text-[9px] font-medium text-gray-700 text-center truncate w-full">{preset.tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {showAvatarUrlInput && (
                    <div className="p-2.5 bg-orange-50/70 border border-orange-200 rounded-lg flex gap-2 items-center">
                      <input
                        type="url"
                        value={avatarUrlText}
                        onChange={(e) => setAvatarUrlText(e.target.value)}
                        placeholder="Cole o link da foto (ex: https://...)"
                        className="flex-1 bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={handleSetAvatarFromUrl}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold whitespace-nowrap"
                      >
                        Aplicar e Salvar
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                    placeholder="Ex: Carlos Eduardo Eletricista"
                  />

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Link / Slug Personalizado do Site <span className="text-orange-600">*</span>
                    </label>
                    <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500 focus-within:bg-white text-sm font-mono">
                      <span className="text-gray-400 select-none">{getDisplayHost()}/p/</span>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                        className="bg-transparent text-orange-600 focus:outline-none w-full font-bold ml-0.5"
                        placeholder="seu-nome"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profession and WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Profissão / Especialidade <span className="text-orange-600">*</span>
                  </label>
                  <ProfessionSelect
                    value={formData.profession}
                    onChange={(prof) => setFormData({ ...formData, profession: prof })}
                    placeholder="Selecione ou digite..."
                    required
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Digite para autocompletar ou escolha em Outras.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                    WhatsApp para Clientes <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={formData.whatsapp_number}
                      onChange={(e) => handleWhatsappChange(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* City and Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Cidade / Região Atendida <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={formData.city_state}
                      onChange={(e) => setFormData({ ...formData, city_state: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Ex: Curitiba - PR e Região Metropolitana"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Anos de Experiência no Ramo
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.years_experience || 5}
                    onChange={(e) => setFormData({ ...formData, years_experience: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Breve Descrição do seu Trabalho (Bio)
                </label>
                <textarea
                  rows={3}
                  value={formData.bio_short}
                  onChange={(e) => setFormData({ ...formData, bio_short: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none leading-relaxed"
                  placeholder="Ex: Atendimento rápido para emergências elétricas, reformas de quadros de distribuição e laudos técnicos. Pontualidade e limpeza após o serviço garantidas."
                />
              </div>

              {/* Badges / Trust Checkboxes */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.offers_warranty}
                    onChange={(e) => setFormData({ ...formData, offers_warranty: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="text-gray-700 font-medium">Oferece Garantia</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.accepts_pix}
                    onChange={(e) => setFormData({ ...formData, accepts_pix: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="text-gray-700 font-medium">Aceita PIX</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.accepts_cards}
                    onChange={(e) => setFormData({ ...formData, accepts_cards: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="text-gray-700 font-medium">Aceita Cartão</span>
                </label>
              </div>

            </div>
          </div>

          {/* Card 2: Galeria de Fotos dos Serviços */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-600" />
                <span>2. Galeria de Fotos de Serviços Realizados</span>
              </h2>
              <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-bold">
                {gallery.length} fotos
              </span>
            </div>

            {/* Upload Area */}
            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 hover:border-orange-500 transition-colors mb-5">
              
              {/* Mode Toggle: File vs Image Link */}
              <div className="flex items-center gap-2 mb-3 bg-gray-200/70 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('file')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    photoInputMode === 'file'
                      ? 'bg-white text-orange-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar do Aparelho</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    photoInputMode === 'url'
                      ? 'bg-white text-orange-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Inserir por Link (URL)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                
                <div className="sm:col-span-8 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Título do serviço (ex: Quadro Trifásico NBR-5410)"
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <select
                      value={newPhotoTag}
                      onChange={(e: any) => setNewPhotoTag(e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-orange-700 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Instalação">Instalação</option>
                      <option value="Antes e Depois">Antes e Depois</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Acabamento">Acabamento</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Descrição rápida do trabalho feito para o cliente ler..."
                    value={newPhotoDesc}
                    onChange={(e) => setNewPhotoDesc(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  {photoInputMode === 'url' && (
                    <div className="flex gap-2 items-center pt-1">
                      <input
                        type="url"
                        placeholder="Cole o link da imagem (ex: https://...jpg / png)"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                      />
                      {newPhotoUrl.trim() && (
                        <img
                          src={newPhotoUrl.trim()}
                          alt="Prévia"
                          className="w-8 h-8 rounded object-cover border border-gray-300 shrink-0 bg-gray-100"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-4 flex flex-col gap-1.5">
                  {photoInputMode === 'file' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="w-full py-2.5 px-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        {uploadingPhoto ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>Enviar Foto do Celular</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <span className="text-[10px] text-gray-400 text-center">
                        Upload direto com salvamento local + Supabase
                      </span>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleAddPhotoByUrl}
                        disabled={!newPhotoUrl.trim()}
                        className="w-full py-2.5 px-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar por Link</span>
                      </button>
                      <span className="text-[10px] text-gray-400 text-center">
                        Insira URLs do Google Drive, Unsplash, Imgur, etc.
                      </span>
                    </>
                  )}
                </div>

              </div>

              {/* Quick sample photo loader */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] text-gray-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-600" />
                    <span>Fotos de exemplo prontas (clique para adicionar):</span>
                  </span>
                  {gallery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Deseja excluir todas as fotos da galeria para começar do zero?')) {
                          gallery.forEach(p => onDeletePhoto(p.id));
                        }
                      }}
                      className="text-[10px] text-red-600 hover:text-red-700 font-semibold hover:underline"
                    >
                      Limpar todas as fotos
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAddSamplePhoto(
                      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
                      'Quadro de Distribuição e Disjuntores',
                      'Instalação'
                    )}
                    className="text-[10px] bg-white hover:bg-orange-50 hover:border-orange-300 border border-gray-300 text-gray-700 px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1"
                  >
                    + Elétrica
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSamplePhoto(
                      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
                      'Instalação de Ar Split Inverter',
                      'Instalação'
                    )}
                    className="text-[10px] bg-white hover:bg-orange-50 hover:border-orange-300 border border-gray-300 text-gray-700 px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1"
                  >
                    + Ar-Condicionado
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSamplePhoto(
                      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
                      'Móvel Planejado de Cozinha',
                      'Acabamento'
                    )}
                    className="text-[10px] bg-white hover:bg-orange-50 hover:border-orange-300 border border-gray-300 text-gray-700 px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1"
                  >
                    + Marcenaria
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSamplePhoto(
                      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
                      'Pintura Interna e Acabamento Fino',
                      'Acabamento'
                    )}
                    className="text-[10px] bg-white hover:bg-orange-50 hover:border-orange-300 border border-gray-300 text-gray-700 px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1"
                  >
                    + Pintura
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSamplePhoto(
                      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
                      'Instalação e Troca de Tubulação Hidráulica',
                      'Manutenção'
                    )}
                    className="text-[10px] bg-white hover:bg-orange-50 hover:border-orange-300 border border-gray-300 text-gray-700 px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1"
                  >
                    + Hidráulica
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            {gallery.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-gray-900">Sua galeria está vazia</h4>
                <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                  Adicione fotos de serviços concluídos pelo celular ou clique nos botões de amostra acima para começar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {gallery.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white border border-gray-200 hover:border-orange-400 rounded-xl overflow-hidden group transition-all flex flex-col justify-between shadow-2xs"
                  >
                    <div className="relative aspect-video bg-gray-100">
                      <img
                        src={photo.image_url}
                        alt={photo.title || 'Foto de serviço'}
                        className="w-full h-full object-cover"
                      />
                      {photo.tag && (
                        <span className="absolute top-2 left-2 bg-gray-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          {photo.tag}
                        </span>
                      )}

                      {/* Quick Top Right Action Buttons */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-gray-900/70 p-1 rounded-lg backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={() => handleStartEditPhoto(photo)}
                          className="p-1 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-md transition-colors"
                          title="Editar detalhes desta foto"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoToDelete(photo)}
                          className="p-1 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-md transition-colors"
                          title="Excluir foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3">
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                        {photo.title || 'Serviço Executado'}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {photo.description || 'Sem descrição cadastrada.'}
                      </p>

                      {/* Bottom Footer Actions */}
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">
                          {photo.created_at ? new Date(photo.created_at).toLocaleDateString('pt-BR') : 'Foto ativa'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditPhoto(photo)}
                            className="px-2.5 py-1 text-[11px] font-bold text-orange-600 hover:bg-orange-50 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoToDelete(photo)}
                            className="px-2.5 py-1 text-[11px] font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Live Mobile Preview & Share Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Traffic & Monetization Meter Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                <span>Tráfego & Limite Mensal</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                isPro ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
              }`}>
                {isPro ? 'Plano PRO Ativo' : 'Plano Grátis'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-800 mb-1">
                  <span>Visualizações este mês:</span>
                  <span className="font-mono text-orange-600">{currentViews} / {monthlyViewsLimit}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      viewsPercent > 90 ? 'bg-red-500' : viewsPercent > 70 ? 'bg-amber-500' : 'bg-orange-600'
                    }`}
                    style={{ width: `${viewsPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>Fotos no portfólio: {gallery.length}/{photoLimit}</span>
                  <span>{viewsPercent}% do limite</span>
                </div>
              </div>

              {!isPro ? (
                <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Dobre seus orçamentos no WhatsApp</span>
                      <span className="text-[11px] text-gray-600 leading-tight block mt-0.5">
                        No PRO você tem até 30 fotos, 2.500 visualizações/mês, selo verificado e suporte prioritário.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUpgradeReason('manual');
                      setShowUpgradeModal(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-black rounded-lg shadow-xs transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>ASSINAR PRO POR R$ {systemSettings.price_pro_monthly?.toFixed(2) || '29,90'}/MÊS</span>
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Selo Verificado & Tráfego Ilimitado</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">Ativo</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Share / Link Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-orange-600" />
                <span>Link Público do seu Site</span>
              </span>
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded uppercase">
                Online & Ativo
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between gap-2 mb-3">
              <div className="truncate font-mono text-xs text-gray-800">
                {getDisplayHost()}/p/<strong className="text-orange-600">{formData.username}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(cleanShareUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-bold rounded-md shrink-0 flex items-center gap-1 shadow-2xs"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(true)}
                className="py-2 px-3 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5 text-orange-600" />
                <span>Gerar QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('public_profile')}
                className="py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Site</span>
              </button>
            </div>
          </div>

          {/* Live Mobile Simulator Frame (Matches the High Density Theme) */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-gray-900">Visualização Mobile em Tempo Real</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Dispositivo</span>
            </div>

            {/* High Density Phone Frame */}
            <div className="w-[320px] sm:w-[340px] border-[8px] border-gray-900 rounded-[40px] shadow-2xl bg-white relative overflow-hidden">
              
              {/* Notch */}
              <div className="h-6 w-32 bg-gray-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20" />

              {/* Inside Screen */}
              <div className="h-[480px] overflow-y-auto no-scrollbar relative bg-gray-50 flex flex-col justify-between pt-6">
                
                <div>
                  {/* Top Cover */}
                  <div className="bg-orange-600 h-24 relative" />

                  {/* Profile Info */}
                  <div className="px-4 -mt-10 relative z-10 text-center mb-4">
                    <img
                      src={formData.avatar_url || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789'}
                      alt="Avatar"
                      className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-md mx-auto object-cover"
                    />
                    <h3 className="font-bold text-base text-gray-900 mt-2">{formData.full_name || 'Seu Nome'}</h3>
                    <p className="text-xs text-orange-600 font-bold">{formData.profession || 'Especialidade'}</p>
                    
                    <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{formData.city_state || 'Sua Cidade - UF'}</span>
                    </div>

                    <p className="text-[11px] text-gray-600 mt-2.5 p-2.5 bg-white rounded-lg border border-gray-200 text-left leading-relaxed shadow-2xs">
                      {formData.bio_short || 'Sua bio e apresentação para o cliente...'}
                    </p>

                    {/* Trust row */}
                    <div className="grid grid-cols-3 gap-1 mt-2 text-center text-[10px]">
                      <div className="bg-white p-1 rounded border border-gray-200 text-orange-700 font-bold">100% Garantia</div>
                      <div className="bg-white p-1 rounded border border-gray-200 text-emerald-700 font-bold">WhatsApp</div>
                      <div className="bg-white p-1 rounded border border-gray-200 text-orange-700 font-bold">PIX/Cartão</div>
                    </div>
                  </div>

                  {/* Gallery in mobile sim */}
                  <div className="px-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-900">Fotos dos Serviços</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{gallery.length} fotos</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {gallery.slice(0, 4).map(p => (
                        <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 border border-gray-200 shadow-2xs">
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                          {p.tag && (
                            <span className="absolute bottom-1 left-1 bg-gray-900/80 text-[8px] text-white px-1 rounded font-medium">
                              {p.tag}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating WhatsApp in simulator */}
                <div className="sticky bottom-0 p-3 bg-white/95 backdrop-blur-xs border-t border-gray-100 z-10">
                  <div className="bg-[#25D366] text-white py-2.5 px-3 rounded-full text-center font-bold text-xs shadow-md flex items-center justify-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>SOLICITAR ORÇAMENTO NO WHATSAPP</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Modal de Publicação & Compartilhamento (QR Code / WhatsApp) */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-gray-900">
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-gray-900 font-['Syne',sans-serif]">
                Site Atualizado e Publicado!
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Seu portfólio já está disponível no link abaixo e pronto para ser compartilhado com seus clientes.
              </p>
            </div>

            {/* Generated Link Input */}
            <div className="mt-5 p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <span className="text-xs font-mono text-orange-700 truncate font-semibold">
                {cleanShareUrl}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(cleanShareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-2xs transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <a
                  href={cleanShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
                  title="Testar link no navegador"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir</span>
                </a>
              </div>
            </div>

            {/* Real QR Code Generator for Vehicle Sticker / Business Card */}
            <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
              <div className="flex justify-center p-3 bg-white rounded-xl border border-gray-200 inline-block shadow-sm">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt={`QR Code para ${cleanShortDisplayUrl}`} 
                    className="w-40 h-40 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                  </div>
                )}
              </div>
              <p className="text-xs font-bold text-gray-900 mt-2.5">
                QR Code Escaneável para Cartão de Visita ou Adesivo do Carro
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Aponte a câmera do celular para abrir direto: <strong className="text-orange-600">{cleanShortDisplayUrl}</strong>
              </p>

              {qrCodeDataUrl && (
                <div className="mt-3 flex justify-center">
                  <a
                    href={qrCodeDataUrl}
                    download={`qrcode-${formData.username}.png`}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-400" />
                    <span>Baixar Imagem do QR Code (PNG)</span>
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowPublishModal(false);
                  setCurrentView('public_profile');
                }}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>VER MEU SITE GERADO AGORA</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Editar Foto do Portfólio</h3>
                  <p className="text-[11px] text-gray-500">Atualize o título, categoria, descrição ou imagem.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPhoto} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
              {/* Photo Preview & Replace */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1.5">
                  Pré-visualização da Imagem
                </label>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group">
                  <img
                    src={editPhotoUrl}
                    alt={editPhotoTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Trocar Arquivo</span>
                    </button>
                  </div>
                </div>
                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditPhotoFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Título do Serviço *
                </label>
                <input
                  type="text"
                  value={editPhotoTitle}
                  onChange={(e) => setEditPhotoTitle(e.target.value)}
                  placeholder="Ex: Instalação de Ar Split 12.000 BTUs"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              {/* Category / Tag */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Categoria / Tag de Destaque
                </label>
                <select
                  value={editPhotoTag}
                  onChange={(e) => setEditPhotoTag(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-500 focus:outline-none font-medium text-gray-700"
                >
                  <option value="Instalação">Instalação</option>
                  <option value="Antes e Depois">Antes e Depois</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Acabamento">Acabamento</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Descrição Detalhada do Trabalho
                </label>
                <textarea
                  value={editPhotoDesc}
                  onChange={(e) => setEditPhotoDesc(e.target.value)}
                  rows={3}
                  placeholder="Descreva o que foi feito, materiais utilizados, garantia dada..."
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Direct Image URL */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Link Direto da Imagem (URL)
                </label>
                <input
                  type="url"
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-500 focus:outline-none font-mono"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Photo Confirmation Modal */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-200 shadow-2xl p-5 text-center animate-fadeIn">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Excluir esta foto?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Tem certeza que deseja remover <strong>"{photoToDelete.title || 'esta foto'}"</strong> do seu portfólio?
            </p>

            <div className="my-3.5 aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
              <img
                src={photoToDelete.image_url}
                alt={photoToDelete.title || 'Foto'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePhoto(photoToDelete.id);
                  setPhotoToDelete(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Upgrade Modal */}
      {showUpgradeModal && (
        <PlanUpgradeModal
          isOpen={showUpgradeModal}
          profile={formData}
          systemSettings={systemSettings}
          onClose={() => setShowUpgradeModal(false)}
          onUpgradeSuccess={(updatedProfile) => {
            setFormData(updatedProfile);
            onSaveProfile(updatedProfile);
            setShowUpgradeModal(false);
          }}
          reason={upgradeReason}
        />
      )}

    </div>
  );
};
