'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
} from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { rpaNavigationConfig } from '~/config/rpa-navigation.config';

export function RPASidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={'h-16 justify-center'}>
        <AppLogo href={'/rpa/dashboard'} className="max-w-full p-2" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation config={rpaNavigationConfig} />
      </SidebarContent>

      <SidebarFooter>
        {/* Profile dropdown removed temporarily for testing */}
      </SidebarFooter>
    </Sidebar>
  );
}
