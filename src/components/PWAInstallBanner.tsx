import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or if running as PWA
    if (localStorage.getItem('pwa-banner-dismissed')) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const timer = setTimeout(() => setShow(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (!show) return null;

  return (
    <>
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <span className="text-2xl">📲</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Adicione o Mater à sua tela inicial
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs font-semibold text-primary hover:underline mt-0.5"
            >
              Como fazer →
            </button>
          </div>
          <button onClick={dismiss} className="p-1 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-display">
              Instalar o Mater
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {isIOS ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">No iPhone / iPad:</p>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">1.</span>
                    Toque no ícone de compartilhar <span className="inline-block text-lg leading-none">⬆️</span> na barra do Safari
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">2.</span>
                    Role e toque em <strong>"Adicionar à Tela de Início"</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">3.</span>
                    Toque em <strong>"Adicionar"</strong>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">No Android:</p>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">1.</span>
                    Toque nos três pontos <span className="inline-block text-lg leading-none">⋮</span> no canto superior
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">2.</span>
                    Toque em <strong>"Adicionar à tela inicial"</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">3.</span>
                    Confirme tocando em <strong>"Adicionar"</strong>
                  </li>
                </ol>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setShowModal(false);
              dismiss();
            }}
            className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm"
          >
            Entendi!
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
