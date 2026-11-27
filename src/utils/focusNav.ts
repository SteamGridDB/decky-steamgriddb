import { getFocusNavController } from '@decky/ui';

type NavNode = {
  Element?: HTMLElement | null;
  m_rgChildren?: NavNode[];
  BTakeFocus?: () => void;
};

type NavContext = {
  m_LastActiveNavTree?: {
    Root?: NavNode;
  };
};

type FocusNavController = {
  GetActiveContext?: () => NavContext | undefined;
  FindAnActiveContext?: () => NavContext | undefined;
};

/**
 * Focus an element through Steam's gamepad nav tree.
 *
 * Calling HTMLElement.focus() moves DOM focus, but the gamepad nav tree does not
 * always notice that, so D-pad navigation can get stuck and the focus ring does
 * not update. BTakeFocus() updates both.
 */
const focusElementInNavTree = (element: HTMLElement | null) => {
  if (!element) return;

  const controller = getFocusNavController() as FocusNavController | undefined;
  const context = controller?.GetActiveContext?.() ?? controller?.FindAnActiveContext?.();
  const root = context?.m_LastActiveNavTree?.Root;

  const findNode = (node: NavNode | undefined, target: HTMLElement): NavNode | null => {
    if (!node) return null;
    if (node.Element === target) return node;
    for (const child of node.m_rgChildren ?? []) {
      const found = findNode(child, target);
      if (found) return found;
    }
    return null;
  };

  const node = findNode(root, element);
  if (node?.BTakeFocus) {
    node.BTakeFocus();
    return;
  }

  element.focus();
};

export default focusElementInNavTree;
