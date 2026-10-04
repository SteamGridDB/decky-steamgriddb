import { Module, findModuleByExport, fakeRenderComponent } from '@decky/ui';

type AdaptiveNavGlyphProps = {
  button: number;
  bAllowKeyboard?: boolean;
  bKnockout?: boolean;
  className?: string;
};

const glyphModules = findModuleByExport((e) => typeof e === 'function' && e.toString().includes('GamepadUI_KeyboardNavGlyphsDisabled'));

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
