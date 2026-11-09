'use client';

import type { FC } from 'react';
import type { CheckoutPolicyLink } from '../types.js';

interface PolicyLinksProps {
  links: CheckoutPolicyLink[];
}

// The storefront's policy pages under the form; nothing when it names none
export const PolicyLinks: FC<PolicyLinksProps> = ({ links }) =>
  links.length > 0 ? (
    <nav aria-label="Store policies" className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5 text-xs">
      {links.map((link) => (
        <a key={link.href} href={link.href} className="text-primary hover:underline">
          {link.label}
        </a>
      ))}
    </nav>
  ) : null;
