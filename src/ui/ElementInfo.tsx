import { Droplets, Flame, Leaf, Moon, Mountain, Zap } from 'lucide-react';
import { elementById, elements, type ElementId } from '@/data/elements';
import { elementMultiplier } from '@/lib/damage';

const icons = { brasa: Flame, mare: Droplets, folha: Leaf, faisca: Zap, pedra: Mountain, sombra: Moon };

export function ElementGlyph({ element, size = 17 }: { element: ElementId; size?: number }) {
  const Icon = icons[element];
  return <Icon size={size} aria-hidden="true" style={{ color: elementById[element].color }} />;
}

export function ElementTag({ element }: { element: ElementId }) {
  return <span className="element-tag"><ElementGlyph element={element} size={14} />{elementById[element].name}</span>;
}

export function ElementInfo({ element, incoming = false, heading }: { element: ElementId; incoming?: boolean; heading?: string }) {
  const matchups = elements.map(({ id }) => ({
    id,
    multiplier: incoming ? elementMultiplier(id, element) : elementMultiplier(element, id),
  })).filter(({ multiplier }) => multiplier !== 1).sort((a, b) => b.multiplier - a.multiplier);

  return (
    <div className="matchups">
      <span>{heading ?? (incoming ? 'Dano recebido por elemento' : 'Dano causado por elemento')}</span>
      <ul>
        {matchups.map(({ id, multiplier }) => (
          <li key={id}><ElementTag element={id} /><strong>{multiplier === 0.5 ? '0,5' : multiplier}×</strong></li>
        ))}
      </ul>
    </div>
  );
}
