import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card-elevated max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            <Sparkles className="inline mr-2 text-primary" size={24} />
            Mater Completo
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Desbloqueie todas as funcionalidades: Diário, Cartas para o bebê, Agenda completa e muito mais.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 text-sm">
            <span>📖</span><span>Diário da gestação com fotos</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>💌</span><span>Cartas para o bebê</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>📅</span><span>Agenda completa de consultas</span>
          </div>
        </div>
        <Button
          className="w-full gradient-hero text-primary-foreground font-semibold"
          onClick={() => window.open('#checkout-placeholder', '_blank')}
        >
          Desbloquear Mater Completo
        </Button>
      </DialogContent>
    </Dialog>
  );
}
