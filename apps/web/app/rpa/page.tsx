import { redirect } from 'next/navigation';

import pathsConfig from '~/config/paths.config';

export default function RPAHomePage() {
  redirect(pathsConfig.rpa.dashboard);
}
