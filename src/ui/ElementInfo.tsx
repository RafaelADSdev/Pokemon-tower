import { Droplets, Flame, Leaf, Moon, Mountain, Zap } from 'lucide-react';
import { elementById, elements, type ElementId } from '@/data/elements';
import { elementMultiplier } from '@/lib/damage';
import { useLocale } from './locale';

const icons = { brasa: Flame, mare: Droplets, folha: Leaf, faisca: Zap, pedra: Mountain, sombra: Moon };

export function ElementGlyph({ element, size = 17 }: { element: ElementId; size?: number }) {
  const Icon = icons[element];
  return <Icon size={size} aria-hidden="true" style={{ color: elementById[element].color }} />;
}

export function ElementTag({ element }: { element: ElementId }) {
  const { localized } = useLocale();
  return <span className="element-tag"><ElementGlyph element={element} size={14} />{localized(elementById[element])}</span>;
}

export function ElementInfo({ element, incoming = false, heading }: { element: ElementId; incoming?: boolean; heading?: string }) {
  const { language, t } = useLocale();
  const matchups = elements.map(({ id }) => ({
    id,
    multiplier: incoming ? elementMultiplier(id, element) : elementMultiplier(element, id),
  })).filter(({ multiplier }) => multiplier !== 1).sort((a, b) => b.multiplier - a.multiplier);

  return (
    <div className="matchups">
      <span>{heading ?? (incoming ? t.incomingDamage : t.outgoingDamage)}</span>
      <ul>
        {matchups.map(({ id, multiplier }) => (
          <li key={id}><ElementTag element={id} /><strong>{multiplier.toLocaleString(language)}×</strong></li>
        ))}
      </ul>
    </div>
  );
}
