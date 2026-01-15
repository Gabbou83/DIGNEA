import { getLogger } from '@kit/shared/logger';

/**
 * @name i18nResolver
 * @description Resolve the translation file for the given language and namespace in the dev-tool application.
 * @param language
 * @param namespace
 */
export async function i18nResolver(language: string, namespace: string) {
  const logger = await getLogger();

  try {
    // Use relative path to web app's locales directory
    // This path remains stable as long as the internal structure doesn't change
    const data = await import(
      `../../../web/public/locales/${language}/${namespace}.json`
    );

    return data as Record<string, string>;
  } catch (error) {
    console.group(
      `Error while loading translation file: ${language}/${namespace}`,
    );
    logger.error(error instanceof Error ? error.message : error);
    logger.warn(
      `Please create a translation file for this language at "public/locales/${language}/${namespace}.json"`,
    );
    console.groupEnd();

    // return an empty object if the file could not be loaded to avoid loops
    return {};
  }
}
