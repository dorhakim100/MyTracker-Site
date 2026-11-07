import i18n from '../../i18n'

export function registerLocals(
  ns: string,
  resources: { eng: Record<string, unknown>; heb: Record<string, unknown> }
) {
  i18n.addResourceBundle('en', ns, resources.eng, true, true)
  i18n.addResourceBundle('he', ns, resources.heb, true, true)
}
