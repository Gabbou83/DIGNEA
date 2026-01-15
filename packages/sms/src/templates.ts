/**
 * DIGNEA SMS Templates
 * Pre-defined SMS message templates for different scenarios
 */

export const SMS_TEMPLATES = {
  /**
   * Daily availability reminder
   */
  dailyReminder: (rpaName: string, lastCount?: number): string => {
    if (lastCount !== undefined) {
      return `Bonjour! DIGNEA 🏠\n\nHier : ${lastCount} dispo(s) a ${rpaName}.\n\nToujours pareil? Repondez OUI ou le nouveau chiffre.`;
    }

    return `Bonjour! DIGNEA 🏠\n\nCombien d'unites disponibles aujourd'hui a ${rpaName}?\n\nRepondez avec le chiffre (ex: 3) ou 0 si complet.`;
  },

  /**
   * Confirmation of availability update
   */
  updateConfirmation: (rpaName: string, count: number): string => {
    return `✅ DIGNEA - Note : ${count} dispo(s) a ${rpaName}. Merci!`;
  },

  /**
   * Urgent placement broadcast
   */
  urgentBroadcast: (rpaName: string, patientSummary: string): string => {
    return `🚨 URGENCE - DIGNEA\n\nDemande urgente (48h) pour ${rpaName}.\n\nProfil: ${patientSummary}\n\nRepondez OUI si dispo ou NON si complet.\n\nMerci!`;
  },

  /**
   * Welcome message for new RPA
   */
  welcome: (rpaName: string): string => {
    return `Bienvenue sur DIGNEA! 🏠\n\n${rpaName} est maintenant connecte.\n\nVous recevrez un SMS chaque matin pour confirmer vos disponibilites.\n\nRepondez simplement avec le nombre d'unites disponibles.`;
  },

  /**
   * Inquiry notification
   */
  inquiryNotification: (
    rpaName: string,
    inquirerName: string,
    patientInfo: string,
  ): string => {
    return `📬 DIGNEA - Nouvelle demande\n\n${inquirerName} s'interesse a ${rpaName}.\n\nProfil: ${patientInfo}\n\nConnectez-vous sur dignea.com/rpa pour repondre.`;
  },

  /**
   * Error - invalid response
   */
  invalidResponse: (): string => {
    return `❌ DIGNEA - Format invalide.\n\nRepondez OUI (si pareil) ou le chiffre (ex: 3 ou 0 si complet).`;
  },

  /**
   * Thank you message
   */
  thankYou: (): string => {
    return `Merci! Votre mise a jour aide des familles quebecoises. ❤️\n\n- L'equipe DIGNEA`;
  },
} as const;
