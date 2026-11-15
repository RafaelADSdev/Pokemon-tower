import { Bloom, EffectComposer } from "@react-three/postprocessing";

export default function PostProcessing() {
  return (
    <EffectComposer multisampling={2}>
      <Bloom luminanceThreshold={0.92} luminanceSmoothing={0.25} intensity={0.24} mipmapBlur />
    </EffectComposer>
  );
}
