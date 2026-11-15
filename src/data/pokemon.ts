export const pokemonAssetsRevision = '429de1288cea0d43f5b4f56305d2276e94239d65';
const modelDirectory = `https://raw.githubusercontent.com/Pokemon-3D-api/assets/${pokemonAssetsRevision}/models/opt/regular`;

export function pokemonAppearance(dex: number, name: string) {
  return { name, nameEn: name, model: `${modelDirectory}/${dex}.glb` };
}

export function pokemonPortrait(dex: number) {
  return `/images/pokemon/${dex}.webp`;
}
