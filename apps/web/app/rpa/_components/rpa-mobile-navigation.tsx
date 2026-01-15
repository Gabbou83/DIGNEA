import Link from 'next/link';

import { Menu } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

import pathsConfig from '~/config/paths.config';

export function RPAMobileNavigation() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu className={'h-8 w-8'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link href={pathsConfig.rpa.dashboard}>Tableau de bord</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Link href={pathsConfig.rpa.availability}>Disponibilites</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Link href={pathsConfig.rpa.inquiries}>Demandes</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Link href={pathsConfig.rpa.settings}>Parametres</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
