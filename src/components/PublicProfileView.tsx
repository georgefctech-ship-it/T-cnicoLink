import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  MapPin, 
  CheckCircle, 
  ShieldCheck, 
  Star, 
  Phone, 
  Share2, 
  QrCode, 
  Calendar, 
  X, 
  Award, 
  Check, 
  Maximize2, 
  Minimize2, 
  ChevronRight,
  Sparkles,
  Zap,
  Clock,
  CreditCard,
  Lock,
  Crown,
  Download,
  Loader2,
  Plus,
  Send,
  Trash2,
  User,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { Profile, ServicePhoto, Testimonial, SystemSettings } from '../types';
import { DEFAULT_SYSTEM_SETTINGS } from '../lib/mockData';
import { 
  getCleanShareUrl, 
  getQrCodeScanUrl, 
  getCleanDisplayUrl 
} from '../lib/profileUrlHelper';

interface PublicProfileViewProps {
  profile: Profile;
  gallery: ServicePhoto[];
  testimonials?: Testimonial[];
  onAddTestimonial?: (testimonial: Testimonial) => void;
  onDeleteTestimonial?: (testimonialId: string) => void;
  onBackToPanel?: () => void;
  systemSettings?: SystemSettings;
  onTrackView?: () => void;
  onTrackWhatsAppClick?: () => void;
  isPublicVisitor?: boolean;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
  profile,
  gallery,
  testimonials = [],
  onAddTestimonial,
  onDeleteTestimonial,
  onBackToPanel,
  systemSettings = DEFAULT_SYSTEM_SETTINGS,
  onTrackView,
  onTrackWhatsAppClick,
  isPublicVisitor = false,
}) => {
  const [activeTag, setActiveTag] = useState<string>('Todos');
  const [selectedPhoto, setSelectedPhoto] = useState<ServicePhoto | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'full'>('full');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Real-time Testimonial / Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [clientName, setClientName] = useState('');
  const [clientNeighborhood, setClientNeighborhood] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [commentText, setCommentText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);

  const totalReviews = testimonials.length;
  const avgRating = totalReviews > 0
    ? (testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  const cleanShareUrl = getCleanShareUrl(profile.username);
  const qrScanUrl = getQrCodeScanUrl(profile);
  const cleanDisplayUrl = getCleanDisplayUrl(profile.username);

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

  // Track view once on mount
  useEffect(() => {
    if (onTrackView) {
      onTrackView();
    }
  }, []);

  const isPro = profile.plan === 'pro' || profile.plan === 'enterprise';

  // Format WhatsApp Link
  const rawPhone = profile.whatsapp_number.replace(/\D/g, '');
  const cleanPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
  const defaultMsg = encodeURIComponent(
    `Olá ${profile.full_name}, vi seu portfólio no TécnicoLink e gostaria de solicitar um orçamento para um serviço!`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${defaultMsg}`;

  const handleWhatsAppClick = () => {
    if (onTrackWhatsAppClick) {
      onTrackWhatsAppClick();
    }
  };

  // Filter gallery
  const filteredPhotos = activeTag === 'Todos' 
    ? gallery 
    : gallery.filter(p => p.tag === activeTag);

  // Available tags
  const tags = ['Todos', ...Array.from(new Set(gallery.map(p => p.tag).filter(Boolean)))];

  if (profile.status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Página Indisponível</h1>
            <p className="text-xs text-gray-500 mt-1">
              O portfólio de <strong>{profile.full_name}</strong> está temporariamente suspenso ou em manutenção pela administração.
            </p>
          </div>
          {onBackToPanel && (
            <button
              onClick={onBackToPanel}
              className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-500 transition-colors"
            >
              Voltar ao Painel
            </button>
          )}
        </div>
      </div>
    );
  }

  const profileContent = (
    <div className="bg-[#F3F4F6] text-[#1F2937] min-h-screen pb-32">
      
      {/* Top Banner / Cover */}
      <div className="relative h-44 sm:h-52 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-20" />
        
        {/* Subtle decorative tool icons pattern */}
        <div className="absolute top-4 right-4 text-white/40 font-mono text-[11px] font-bold">
          REF #{profile.username.toUpperCase()}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10">
        
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm relative">
          
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <img
                src={profile.avatar_url || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789'}
                alt={profile.full_name}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl object-cover border-3 border-white shadow-md ring-2 ring-orange-500"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full ring-2 ring-white" title="Disponível para atendimento">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Profissional Verificado</span>
              </div>

              <h1 className="text-lg sm:text-xl font-black text-gray-900 mt-1 leading-tight tracking-tight">
                {profile.full_name}
              </h1>

              <p className="text-xs sm:text-sm font-bold text-orange-600 mt-0.5">
                {profile.profession}
              </p>

              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{profile.city_state}</span>
              </div>
            </div>
          </div>

          {/* Rating & Fast badges */}
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{profile.rating?.toFixed(1) || '5.0'}</span>
              <span className="text-gray-400 font-normal">({profile.review_count || 48} avaliações)</span>
            </div>

            <div className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Responde rápido no Zap</span>
            </div>
          </div>

          {/* Bio text */}
          <div className="mt-3.5 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 leading-relaxed">
            <p>{profile.bio_short}</p>
          </div>

          {/* Trust Matrix */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="block text-sm font-black text-orange-600">100%</span>
              <span className="text-[10px] text-gray-500 font-medium">Garantia</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="block text-sm font-black text-emerald-600">Sem Taxa</span>
              <span className="text-[10px] text-gray-500 font-medium">Orçamento</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="block text-sm font-black text-orange-600">Pix/Cartão</span>
              <span className="text-[10px] text-gray-500 font-medium">Facilitado</span>
            </div>
          </div>

          {/* Direct Actions (WhatsApp & Share) */}
          <div className="mt-4 flex gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>CHAMAR NO WHATSAPP</span>
            </a>

            <button
              onClick={() => setShowQrModal(true)}
              className="p-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-gray-700 transition-colors"
              title="Ver QR Code / Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Gallery Section */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>Fotos dos Trabalhos Realizados</span>
              </h2>
              <p className="text-[11px] text-gray-500">Clique nas fotos para ampliar e ver detalhes</p>
            </div>
            <span className="text-xs bg-white text-orange-700 font-bold px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
              {filteredPhotos.length} fotos
            </span>
          </div>

          {/* Filter tags */}
          {tags.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
              {tags.map((tag) => (
                <button
                  key={tag as string}
                  onClick={() => setActiveTag(tag as string)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeTag === tag
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-2xs'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer group hover:border-orange-500 transition-all shadow-2xs"
              >
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.title || 'Foto de serviço realizado'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {photo.tag && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded">
                      {photo.tag}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gray-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1 bg-white text-gray-900 text-[11px] font-bold rounded-lg shadow-sm">
                      Ver Foto
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-xs text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {photo.title || 'Serviço Executado'}
                  </h3>
                  {photo.description && (
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Testimonials Section - Real-time Reviews */}
        <div className="mt-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>O que os clientes dizem</span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center text-amber-500 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  <span>{avgRating}</span>
                </div>
                <span className="text-[11px] text-gray-500">
                  • {testimonials.length} {testimonials.length === 1 ? 'avaliação verificada' : 'avaliações verificadas'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowReviewForm(prev => !prev);
                setReviewError('');
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto"
            >
              {showReviewForm ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Fechar Formulário</span>
                </>
              ) : (
                <>
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>+ Avaliar Atendimento</span>
                </>
              )}
            </button>
          </div>

          {/* Success Banner */}
          {reviewSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Avaliação publicada com sucesso!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Seu relato e nota já estão visíveis no perfil do técnico.</p>
              </div>
            </div>
          )}

          {/* Interactive Review Form */}
          {showReviewForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!clientName.trim()) {
                  setReviewError('Por favor, informe seu nome.');
                  return;
                }
                if (!commentText.trim() || commentText.trim().length < 5) {
                  setReviewError('Por favor, escreva um relato sobre o atendimento (mínimo 5 caracteres).');
                  return;
                }
                setReviewError('');

                const newTest: Testimonial = {
                  id: 'test-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                  profile_id: profile.id,
                  client_name: clientName.trim(),
                  client_neighborhood: clientNeighborhood.trim() || profile.city_state || 'Cliente',
                  comment: commentText.trim(),
                  rating: reviewRating,
                  service_type: serviceType.trim() || profile.profession || 'Atendimento Concluído',
                  date: 'Hoje'
                };

                if (onAddTestimonial) {
                  onAddTestimonial(newTest);
                }

                setReviewSuccess(true);
                setClientName('');
                setClientNeighborhood('');
                setServiceType('');
                setCommentText('');
                setReviewRating(5);
                setHoverRating(0);

                setTimeout(() => {
                  setReviewSuccess(false);
                  setShowReviewForm(false);
                }, 2000);
              }}
              className="mb-4 bg-white border-2 border-orange-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
            >
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Deixe sua avaliação para {profile.full_name}</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Sua opinião ajuda outros clientes da sua região a contratarem com total confiança.
                </p>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Selecione sua nota:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || reviewRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-115 transition-transform focus:outline-none"
                        title={`${star} estrelas`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                              : 'text-gray-300 fill-transparent hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-bold text-gray-700">
                    {reviewRating === 5 && '⭐⭐⭐⭐⭐ Excelente! Recomendo muito.'}
                    {reviewRating === 4 && '⭐⭐⭐⭐ Muito bom! Serviço de qualidade.'}
                    {reviewRating === 3 && '⭐⭐⭐ Bom! Atendeu às expectativas.'}
                    {reviewRating === 2 && '⭐⭐ Regular! Poderia ser melhor.'}
                    {reviewRating === 1 && '⭐ Ruim! Tive problemas.'}
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Seu Nome *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo ou Mariana S."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Seu Bairro / Cidade (opcional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={clientNeighborhood}
                      onChange={(e) => setClientNeighborhood(e.target.value)}
                      placeholder={profile.city_state ? `Ex: Centro, ${profile.city_state.split('-')[0] || ''}` : 'Ex: Moema, São Paulo'}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Qual serviço foi realizado? (opcional)
                </label>
                <div className="relative">
                  <CheckCircle className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder={`Ex: ${profile.profession || 'Instalação ou Conserto'}, Manutenção...`}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Seu Comentário / Relato do Atendimento *
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Conte como foi a pontualidade, qualidade do trabalho, limpeza e atendimento..."
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-500 focus:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              {reviewError && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-lg">
                  {reviewError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Avaliação Agora</span>
                </button>
              </div>
            </form>
          )}

          {/* Testimonials List */}
          {testimonials.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-2xs">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-500">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <h3 className="font-bold text-xs text-gray-900">Seja o primeiro a avaliar!</h3>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                Já contratou os serviços de <strong>{profile.full_name}</strong>? Deixe sua nota e depoimento para valorizar o trabalho do profissional.
              </p>
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="mt-3 px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-2xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Escrever Avaliação</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs shadow-2xs relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shrink-0">
                        {test.client_name ? test.client_name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 block">{test.client_name}</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-1.5 py-0.2 rounded-full">
                            Verificado
                          </span>
                        </div>
                        {test.client_neighborhood && (
                          <span className="text-[10px] text-gray-500 block">{test.client_neighborhood}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (test.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-200 fill-transparent'
                            }`}
                          />
                        ))}
                      </div>
                      {test.date && (
                        <span className="text-[9px] text-gray-400 mt-0.5">{test.date}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 italic leading-relaxed pl-1 border-l-2 border-orange-200">
                    "{test.comment}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <div className="text-[10px] text-orange-600 font-semibold">
                      Serviço: {test.service_type || 'Atendimento Geral'}
                    </div>

                    {/* Moderate/Delete button for technician or admin */}
                    {!isPublicVisitor && onDeleteTestimonial && (
                      <div>
                        {deletingTestimonialId === test.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-red-600 font-semibold">Excluir?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteTestimonial(test.id);
                                setDeletingTestimonialId(null);
                              }}
                              className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold hover:bg-red-700"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingTestimonialId(null)}
                              className="text-[9px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingTestimonialId(test.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-400 hover:text-red-600 flex items-center gap-1"
                            title="Remover avaliação"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Excluir</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Why Choose Me / Guarantees */}
        <div className="mt-7 bg-orange-50/70 border border-orange-200 rounded-xl p-4 sm:p-5 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-700">
            Compromisso e Garantia do Técnico
          </h3>
          
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Pontualidade:</strong> Atendimento com horário marcado sem atrasos.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Ambiente Limpo:</strong> Recolhimento de resíduos e limpeza do local ao finalizar.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Materiais de Qualidade:</strong> Instalações dentro das normas de segurança.</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-7 text-center text-[10px] text-gray-500 space-y-1">
          <p>Página gerada via <strong>TécnicoLink</strong> • Portfólios para Profissionais Autônomos</p>
          <p className="text-[9px] text-gray-400">© {new Date().getFullYear()} TécnicoLink • Criado por George Ferreira Costa</p>
        </div>

      </div>

      {/* STICKY BOTTOM BAR (Floating WhatsApp CTA) */}
      <div className="fixed bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-white via-white/95 to-transparent z-40">
        <div className="max-w-lg mx-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3 transition-all"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>SOLICITAR ORÇAMENTO NO WHATSAPP</span>
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-gray-900/70 hover:bg-gray-900 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-video sm:aspect-[16/10] bg-gray-900">
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.title || 'Foto de serviço'}
                className="w-full h-full object-contain"
              />
              {selectedPhoto.tag && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-600 text-white font-bold text-xs rounded-lg shadow-md">
                  {selectedPhoto.tag}
                </span>
              )}
            </div>

            <div className="p-4 sm:p-5">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {selectedPhoto.title || 'Serviço Realizado'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedPhoto.description}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-medium">Gostou deste trabalho?</span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>Pedir Orçamento Similar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code & Share Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900 mb-1">Compartilhar Portfólio</h3>
              <p className="text-xs text-gray-500">Apresentação de {profile.full_name}</p>

              {/* QR Code */}
              <div className="my-4 p-3 bg-white border border-gray-200 rounded-xl mx-auto inline-block shadow-2xs">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR Code para ${cleanDisplayUrl}`}
                    className="w-40 h-40 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs font-mono text-gray-700 truncate mb-3">
                {cleanDisplayUrl}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cleanShareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                </button>

                {qrCodeDataUrl && (
                  <a
                    href={qrCodeDataUrl}
                    download={`qrcode-${profile.username}.png`}
                    className="w-full py-2 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-400" />
                    <span>Baixar Imagem QR Code (PNG)</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937]">
      {/* Top Preview Controls Bar - only shown if owner/preview, hidden for public visitors */}
      {!isPublicVisitor && (
        <div className="sticky top-14 z-30 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-500 text-xs">
              Rota Pública: <strong className="text-orange-600">{cleanDisplayUrl}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'mobile' ? 'full' : 'mobile')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-300 flex items-center gap-1.5 transition-colors font-medium text-xs"
            >
              {viewMode === 'mobile' ? <Maximize2 className="w-3.5 h-3.5 text-orange-600" /> : <Minimize2 className="w-3.5 h-3.5 text-orange-600" />}
              <span>{viewMode === 'mobile' ? 'Modo Tela Cheia' : 'Modo Celular (Mobile)'}</span>
            </button>

            {onBackToPanel && (
              <button
                onClick={onBackToPanel}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-md transition-colors text-xs"
              >
                Editar no Painel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Render based on viewMode */}
      {viewMode === 'mobile' ? (
        <div className="py-6 px-4 flex justify-center bg-[#F3F4F6]">
          <div className="w-full max-w-[420px] bg-white rounded-[36px] border-8 border-gray-800 shadow-xl overflow-hidden relative ring-1 ring-gray-300">
            {/* Dynamic Island */}
            <div className="h-5 bg-gray-800 flex items-center justify-center">
              <div className="w-20 h-3.5 bg-gray-900 rounded-full" />
            </div>
            <div className="max-h-[85vh] overflow-y-auto">
              {profileContent}
            </div>
          </div>
        </div>
      ) : (
        profileContent
      )}
    </div>
  );
};
