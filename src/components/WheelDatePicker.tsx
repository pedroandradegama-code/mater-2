import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

function WheelColumn({ items, selected, onChange }: { items: string[]; selected: number; onChange: (i: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (containerRef.current && !scrollingRef.current) {
      containerRef.current.scrollTop = selected * ITEM_HEIGHT;
    }
  }, [selected]);

  const handleScroll = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    scrollingRef.current = true;
    timeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const idx = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      containerRef.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
      onChange(clamped);
      scrollingRef.current = false;
    }, 80);
  }, [items.length, onChange]);

  const halfVisible = Math.floor(VISIBLE_ITEMS / 2);

  return (
    <div className="relative flex-1" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
      {/* Selection highlight */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10 border-y"
        style={{
          top: halfVisible * ITEM_HEIGHT,
          height: ITEM_HEIGHT,
          borderColor: 'hsl(var(--border))',
        }}
      />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Top padding */}
        <div style={{ height: halfVisible * ITEM_HEIGHT }} />
        {items.map((item, i) => {
          const isSelected = i === selected;
          return (
            <div
              key={`${item}-${i}`}
              className="snap-center flex items-center justify-center cursor-pointer transition-all"
              style={{ height: ITEM_HEIGHT }}
              onClick={() => {
                onChange(i);
                containerRef.current?.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' });
              }}
            >
              <span
                className={`transition-all ${
                  isSelected
                    ? 'text-lg font-bold text-primary'
                    : Math.abs(i - selected) === 1
                    ? 'text-sm opacity-60 text-foreground'
                    : 'text-xs opacity-30 text-muted-foreground'
                }`}
              >
                {item}
              </span>
            </div>
          );
        })}
        {/* Bottom padding */}
        <div style={{ height: halfVisible * ITEM_HEIGHT }} />
      </div>
    </div>
  );
}

interface WheelDatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  title?: string;
  minYear?: number;
  maxYear?: number;
}

export default function WheelDatePicker({
  open,
  onOpenChange,
  onConfirm,
  initialDate,
  title = 'Selecione a data',
  minYear = 1950,
  maxYear = 2030,
}: WheelDatePickerProps) {
  const now = initialDate || new Date();
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(minYear + i));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  const [dayIdx, setDayIdx] = useState(now.getDate() - 1);
  const [monthIdx, setMonthIdx] = useState(now.getMonth());
  const [yearIdx, setYearIdx] = useState(now.getFullYear() - minYear);

  useEffect(() => {
    if (open && initialDate) {
      setDayIdx(initialDate.getDate() - 1);
      setMonthIdx(initialDate.getMonth());
      setYearIdx(initialDate.getFullYear() - minYear);
    }
  }, [open, initialDate, minYear]);

  const handleConfirm = () => {
    const year = minYear + yearIdx;
    const month = monthIdx;
    const maxDay = new Date(year, month + 1, 0).getDate();
    const day = Math.min(dayIdx + 1, maxDay);
    onConfirm(new Date(year, month, day));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card-elevated max-w-xs p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1 overflow-hidden rounded-2xl" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
          <WheelColumn items={days} selected={dayIdx} onChange={setDayIdx} />
          <WheelColumn items={MONTHS} selected={monthIdx} onChange={setMonthIdx} />
          <WheelColumn items={years} selected={yearIdx} onChange={setYearIdx} />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {String(dayIdx + 1).padStart(2, '0')} de {MONTH_NAMES[monthIdx]} de {minYear + yearIdx}
        </p>
        <Button onClick={handleConfirm} className="w-full gradient-hero text-primary-foreground rounded-xl mt-2">
          Confirmar
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Helper button that opens the picker
export function DatePickerButton({
  value,
  onChange,
  label,
  title,
  minYear,
  maxYear,
}: {
  value?: Date;
  onChange: (d: Date) => void;
  label: string;
  title?: string;
  minYear?: number;
  maxYear?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl justify-start text-left font-normal"
      >
        {value
          ? `${value.getDate().toString().padStart(2, '0')} de ${MONTH_NAMES[value.getMonth()]} de ${value.getFullYear()}`
          : <span className="text-muted-foreground">{label}</span>}
      </Button>
      <WheelDatePicker
        open={open}
        onOpenChange={setOpen}
        onConfirm={onChange}
        initialDate={value}
        title={title || label}
        minYear={minYear}
        maxYear={maxYear}
      />
    </>
  );
}
