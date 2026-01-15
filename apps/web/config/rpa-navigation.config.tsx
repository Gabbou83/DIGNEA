import { Building2, Calendar, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'rpa:routes.overview',
    children: [
      {
        label: 'rpa:routes.dashboard',
        path: pathsConfig.rpa.dashboard,
        Icon: <LayoutDashboard className={iconClasses} />,
        end: true,
      },
      {
        label: 'rpa:routes.availability',
        path: pathsConfig.rpa.availability,
        Icon: <Calendar className={iconClasses} />,
      },
      {
        label: 'rpa:routes.inquiries',
        path: pathsConfig.rpa.inquiries,
        Icon: <MessageSquare className={iconClasses} />,
      },
    ],
  },
  {
    label: 'rpa:routes.management',
    children: [
      {
        label: 'rpa:routes.settings',
        path: pathsConfig.rpa.settings,
        Icon: <Settings className={iconClasses} />,
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const rpaNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: 'sidebar',
  sidebarCollapsed: undefined,
  sidebarCollapsedStyle: 'icon',
});
