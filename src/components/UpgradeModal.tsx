import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const KIWIFY_URL = 'https://pay.kiwify.com.br/yrK0rg9';

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card-elevated max-w-sm mx-auto">
        <DialogHeader>
          <div className="text-center text-4xl mb-2">🌸</div>
          <DialogTitle className="font-display text-[28px] text-center leading-tight">
            Desbloqueie o Mater Completo
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            Acesso completo durante toda a sua gestação. Pagamento único, sem mensalidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 py-3">
          {[
            'Diário da gestação semana a semana',
            'Cartas para o bebê 💌',
            'Agenda de consultas e exames',
            'Integração com Google Agenda',
            'Sugestão de nomes com IA',
            'Acesso completo para toda a gestação',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5 text-sm">
              <span className="text-primary font-bold mt-0.5">✦</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="text-center py-2">
          <p className="text-3xl font-display font-bold text-primary">R$ 97</p>
          <p className="text-xs text-muted-foreground mt-1">pagamento único · acesso imediato</p>
        </div>

        <Button
          className="w-full gradient-hero text-primary-foreground font-semibold rounded-xl"
          onClick={() => window.open(KIWIFY_URL, '_blank')}
        >
          Garantir meu acesso agora →
        </Button>

        <button
          onClick={onClose}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          Agora não
        </button>
      </DialogContent>
    </Dialog>
  );
}
