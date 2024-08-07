/* eslint-disable @typescript-eslint/no-unused-vars */
import { Focusable, FocusableProps, Navigation } from '@decky/ui';
import { FC } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';

import t from '../utils/i18n';
import showQrModal from '../utils/showQrModal';

const Markdown: FC<{
  onLinkClick?: () => void,
  focusableProps?: Partial<FocusableProps>
} & Options> = ({
  onLinkClick,
  focusableProps,
  children,
  ...props
}) => {
  return (
    <Focusable {...focusableProps}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Match sanitazion from the new site ssr
        disallowedElements={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img']}
        unwrapDisallowed
        components={{
          // Make links usable
          a: ({ node, children, ...linkProps }: JSX.IntrinsicElements['a'] & ReactMarkdownProps) => (
            <Focusable
              onActivate={() => {
                if (linkProps.href) {
                  Navigation.NavigateToExternalWeb(linkProps.href);
                  onLinkClick?.();
                }
              }}
              onSecondaryButton={() => showQrModal(linkProps.href ?? '')}
              onSecondaryActionDescription={t('ACTION_SHOW_LINK_QR', 'Show Link QR')}
              style={{ display: 'inline-block' }}
            >
              <a style={{ textDecoration: 'underline', color: '#1a9fff' }} {...linkProps}>
                {children}
              </a>
            </Focusable>
          ),
        }}
        {...props}
      >
        {children}
      </ReactMarkdown>
    </Focusable>
  );
};

export default Markdown;