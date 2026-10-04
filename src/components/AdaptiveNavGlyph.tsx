import {
  Module,
  Export,
  findModuleByExport,
  fakeRenderComponent,
  createModuleMapping,
} from '@decky/ui';

type AdaptiveNavGlyphProps = {
  button: number;
  bAllowKeyboard?: boolean;
  bKnockout?: boolean;
  className?: string;
};

let glyphModules = findModuleByExport((e) => typeof e === 'function' && e.toString().includes('GamepadUI_KeyboardNavGlyphsDisabled'));
if (!glyphModules) {
  // filter down to modules that only have 2 exports that are memoized components
  // super unstable but all this will never run once steam switches thge current beta to stable
  const glyphModulesOld = createModuleMapping((mod) => {
    if (!mod || typeof mod !== 'object') return false;

    const exports = Object.values(mod);

    return exports.length === 2 &&
    exports.every((e: Export) =>
      e?.$$typeof === Symbol.for('react.memo') &&
      typeof e.type === 'function'
    );
  }).values();

  glyphModules = Array.from(glyphModulesOld).flatMap((mod) => Object.values(mod));
}

const AdaptiveNavGlyph = Object.values(glyphModules).find((mod: Module) => {
  if (typeof mod?.type !== 'function') return false;

  try {
    return fakeRenderComponent(() => {
      const rendered = mod.type({
        button: 2,
        bAllowKeyboard: false,
      });
      const props = rendered?.props;
      return props != null &&
            'controllerType' in props &&
            'controllerStyle' in props &&
            'controllerSource' in props &&
            'controllerModeInput' in props;
    }, { useSyncExternalStore: (_: any, x: () => any) => x?.() });
  } catch {
    return false;
  }
}) as React.ComponentType<AdaptiveNavGlyphProps>;

export default AdaptiveNavGlyph;
