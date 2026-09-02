import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  X, 
  QrCode, 
  Copy, 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  Eye,
  Camera,
  Award,
  CreditCard
} from 'lucide-react';
import { Profile, SystemSettings } from '../types';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onUpgradeSuccess: (updatedProfile: Profile) => void;
  systemSettings: SystemSettings;
  reason?: 'views_limit' | 'photos_limit' | 'manual' | 'pro_feature';
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpgradeSuccess,
  systemSettings,
  reason = 'manual',
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'plans' | 'checkout' | 'success'>('plans');

  if (!isOpen) return null;

  const monthlyPrice = systemSettings.price_pro_monthly || 29.90;
  const yearlyPrice = systemSettings.price_pro_yearly || 290.00;
  const currentPrice = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;
  const pixKey = systemSettings.admin_pix_key || 'georgefctec@gmail.com';
  const pixName = systemSettings.admin_pix_name || 'George - TécnicoLink SaaS';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const updated: Profile = {
        ...profile,
        plan: 'pro',
        max_photos: systemSettings.pro_plan_photo_limit || 30,
        monthly_views_limit: systemSettings.pro_plan_monthly_views || 2500,
        is_verified: true,
        status: 'active',
        subscription_status: 'active',
      };
      onUpgradeSuccess(updated);
      setStep('success');
    }, 1200);
  };

  const whatsappMessage = encodeURIComponent(
    `Olá George! Acabei de fazer o pagamento do plano PRO do TécnicoLink para o técnico "${profile.full_name}" (${profile.username}). Segue meu comprovante PIX de R$ ${currentPrice.toFixed(2)}.`
  );
  const whatsappUrl = `https://wa.me/${systemSettings.admin_whatsapp_billing || '5541999998888'}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-orange-950 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>Desbloquear Plano PRO & Mais Clientes</span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white font-['Syne',sans-serif]">
            {reason === 'views_limit' 
              ? 'Seu Limite Mensal de Visualizações foi Atingido!' 
              : reason === 'photos_limit' 
              ? 'Você Atingiu o Limite de Fotos do Plano Grátis!' 
              : 'Aumente Seus Orçamentos com o TécnicoLink PRO'}
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            {reason === 'views_limit' 
              ? 'Clientes continuam buscando seus serviços. Desbloqueie até 2.500 visualizações mensais e continue recebendo chamados no WhatsApp!' 
              : 'Tenha até 30 fotos de alta qualidade, selo oficial de verificação e prioridade máxima.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-gray-700">
          
          {step === 'plans' && (
            <>
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 p-1 rounded-xl border border-gray-200 flex items-center">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Mensal (R$ {monthlyPrice.toFixed(2).replace('.', ',')}/mês)
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      billingCycle === 'yearly'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span>Anual (R$ {yearlyPrice.toFixed(2).replace('.', ',')})</span>
                    <span className="px-1 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded uppercase">
                      2 meses grátis
                    </span>
                  </button>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-gray-900 flex items-center justify-between border-b border-gray-200 pb-2">
                  <span>Recurso do Portfólio</span>
                  <div className="flex items-center gap-6">
                    <span className="text-gray-400 font-medium">Grátis</span>
                    <span className="text-orange-600 font-black">PRO</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                    <span>Visualizações Mensais (/p/)</span>
                  </div>
                  <div className="flex items-center gap-6 font-semibold">
                    <span className="text-gray-500">{systemSettings.free_plan_monthly_views || 100}</span>
                    <span className="text-emerald-700 font-bold">{systemSettings.pro_plan_monthly_views || 2500}/mês</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-gray-500" />
                    <span>Fotos de Trabalhos na Galeria</span>
                  </div>
                  <div className="flex items-center gap-6 font-semibold">
                    <span className="text-gray-500">{systemSettings.free_plan_photo_limit || 6}</span>
                    <span className="text-orange-600 font-bold">Até {systemSettings.pro_plan_photo_limit || 30} fotos</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-gray-500" />
                    <span>Selo "Profissional Verificado"</span>
                  </div>
                  <div className="flex items-center gap-6 font-semibold">
                    <span className="text-gray-400">Não</span>
                    <span className="text-blue-600 font-bold flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" /> Incluso
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-gray-500" />
                    <span>Remoção de Marca d'água</span>
                  </div>
                  <div className="flex items-center gap-6 font-semibold">
                    <span className="text-gray-400">Não</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" /> 100% Sua Marca
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl shadow-xs transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Continuar para Pagamento via PIX (R$ {currentPrice.toFixed(2).replace('.', ',')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'checkout' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">Total a pagar:</span>
                  <span className="text-orange-700 font-black text-base">R$ {currentPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-white border border-orange-200 text-orange-800 font-bold text-[10px] uppercase">
                  {billingCycle === 'monthly' ? 'Plano Mensal' : 'Plano Anual'}
                </span>
              </div>

              {/* PIX Key Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-orange-600" />
                    <span>Chave PIX Oficial (Copie e Cole)</span>
                  </span>
                  <span className="text-[11px] text-gray-500">{pixName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixKey}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs text-gray-900 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar PIX'}</span>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-xl p-3.5">
                <p className="font-semibold text-gray-900">Como ativar seu plano:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Abra o aplicativo do seu banco e faça o PIX para a chave acima.</li>
                  <li>Clique no botão abaixo para enviar o comprovante no WhatsApp do administrador.</li>
                  <li>Ou clique em <strong>"Confirmar Pagamento e Ativar Imediatamente"</strong>.</li>
                </ol>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar Comprovante pelo WhatsApp</span>
                </a>

                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isProcessing ? 'Validando Assinatura...' : 'Confirmar Pagamento e Ativar Plano PRO'}</span>
                </button>
              </div>

              <button
                onClick={() => setStep('plans')}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 font-medium pt-1"
              >
                Voltar e escolher outro plano
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900">Parabéns! Plano PRO Ativado com Sucesso</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Seu limite foi expandido para até 30 fotos, 2.500 visualizações mensais e seu selo oficial de verificação já está ativo!
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Ir para Meu Painel Atualizado
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
