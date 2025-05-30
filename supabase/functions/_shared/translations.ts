// Shared translations for all Edge Functions

// Type definitions for translations
export interface Template {
  title: string;
  body: string;
}

export interface StreakTranslations {
  templates: Template[];
}

export interface DailyUpdateTranslations {
  morning: {
    noHabits: Template[];
    hasHabits: Template[];
  };
  evening: {
    complete: Template[];
    mediumProgress: Template[];
    lowProgress: Template[];
    noProgress: Template[];
  };
}

export interface HabitsTranslations {
  templates: Template[];
}

export interface LanguageTranslations {
  streak: StreakTranslations;
  dailyUpdate: DailyUpdateTranslations;
  habits: HabitsTranslations;
}

export interface Translations {
  [language: string]: LanguageTranslations; // for future languages
}

export const translations: Translations = {
  en: {
    streak: {
      templates: [
        {
          title: 'Almost at a {milestone}-Day Streak! 🎯',
          body: 'Just 2 more days to reach this milestone!',
        },
        {
          title: '{milestone}-Day Streak Approaching! ✨',
          body: "You're just 2 days away. Keep going!",
        },
        {
          title: 'Streak Alert: {milestone} Days! 🔥',
          body: '2 more days until you hit this milestone!',
        },
        {
          title: 'Close to Your {milestone}-Day Goal! 💪',
          body: "Don't break your streak now - 2 days to go!",
        },
        {
          title: 'Achievement Unlocking Soon! 🏆',
          body: 'Your {milestone}-day streak is just 2 days away!',
        },
        {
          title: '{milestone}-Day Streak Loading... ⏳',
          body: 'Almost there! Just 2 more days!',
        },
        {
          title: 'Streak Check: {milestone} Days Soon! 📈',
          body: 'Stay consistent for 2 more days!',
        },
        {
          title: 'Big Milestone Ahead! 🌟',
          body: 'Your {milestone}-day streak is 2 days away!',
        },
        {
          title: 'Victory in Sight! 🎉',
          body: 'Keep going for your {milestone}-day achievement!',
        },
        {
          title: '2 Days to Your {milestone}-Day Goal! 🚀',
          body: 'Stay on track for this streak milestone!',
        },
      ],
    },
    dailyUpdate: {
      morning: {
        noHabits: [
          {
            title: 'Morning Reminder! ☀️',
            body: 'Create your first habit today!',
          },
          {
            title: 'Fresh Start! 🌱',
            body: 'Add a habit to build your routine.',
          },
          {
            title: 'New Day, New Habits! 🌟',
            body: 'Start your journey today.',
          },
          { title: 'Good Morning! ☕', body: 'Ready to add your first habit?' },
          { title: 'Rise & Shine! 🌞', body: 'Time to create healthy habits.' },
        ],
        hasHabits: [
          {
            title: 'Morning Check-in! ☀️',
            body: 'Time for your daily habits!',
          },
          { title: "Let's Go! 🚀", body: 'Your habits are waiting for you.' },
          {
            title: 'Fresh Day Ahead! 💫',
            body: 'Ready to tackle your habits?',
          },
          { title: 'Rise & Thrive! 🌞', body: 'Check off those habits today!' },
          {
            title: 'Good Morning! ☕',
            body: 'Habits build success. Start now!',
          },
        ],
      },
      evening: {
        complete: [
          {
            title: 'Perfect Day! 🏆',
            body: 'All habits complete! Amazing work!',
          },
          {
            title: 'Flawless! 🎯',
            body: 'You finished all your habits today!',
          },
          { title: 'Champion! 🥇', body: '100% complete. Incredible job!' },
          { title: 'Success! ✅', body: 'All habits done. Feel the progress!' },
          { title: 'Stellar Day! 🌟', body: 'Full completion! Keep it up!' },
        ],
        mediumProgress: [
          {
            title: 'Halfway There! 🚀',
            body: '{count}/{total} habits done today!',
          },
          {
            title: 'Good Progress! 👍',
            body: '{count} done, {remaining} to go.',
          },
          { title: 'Keep Going! 💯', body: "You've done half your habits!" },
          {
            title: 'Mid-Day Check! ⏱️',
            body: '{count} down, {remaining} to go!',
          },
          { title: 'Solid Start! 👊', body: 'Half complete! Finish strong!' },
        ],
        lowProgress: [
          {
            title: 'Started Today! 🌱',
            body: '{count} habit(s) done, more to go!',
          },
          {
            title: 'Keep Going! 👣',
            body: '{count} down, {remaining} to complete!',
          },
          {
            title: 'Progress Update! 📊',
            body: '{count}/{total} habits complete.',
          },
          {
            title: 'Time Check! ⏰',
            body: 'Still time to complete more habits!',
          },
          { title: "You've Begun! 🚀", body: 'Continue your progress today!' },
        ],
        noProgress: [
          {
            title: 'Habits Waiting! ⏰',
            body: 'Still time to make progress today!',
          },
          {
            title: 'Check-in Time! 📝',
            body: "Start a habit before day's end!",
          },
          { title: 'Reminder! 🔔', body: 'Your habits need attention today.' },
          {
            title: 'Evening Update! 🌙',
            body: 'Complete a habit before bedtime!',
          },
          {
            title: 'Not Too Late! ✨',
            body: 'A few minutes can make a difference!',
          },
        ],
      },
    },
    habits: {
      templates: [
        {
          title: '{habit} Time ✨',
          body: 'A few minutes now will make your day better!',
        },
        {
          title: 'Time for {habit}! ⏰',
          body: 'Quick session? Your streak is waiting!',
        },
        {
          title: '{habit} Now! 💪',
          body: 'Your future self will thank you for this.',
        },
        {
          title: "Don't Miss {habit}! 🔥",
          body: 'Your streak is on the line. Open now!',
        },
        {
          title: '{habit} Challenge! 🏆',
          body: "Can you complete this today? You've got this!",
        },
        {
          title: '{habit} Reminder ✓',
          body: 'Tap to track your progress now.',
        },
        {
          title: '{habit} Time! 🚀',
          body: "Small steps, big progress. Let's go!",
        },
        {
          title: 'Keep Going with {habit}! 📈',
          body: 'Consistency wins! Open to continue your streak.',
        },
      ],
    },
  },
  es: {
    streak: {
      templates: [
        {
          title: '¡Casi {milestone} Días de Racha! 🎯',
          body: '¡Solo 2 días más para alcanzar este hito!',
        },
        {
          title: '¡Racha de {milestone} Días Acercándose! ✨',
          body: 'Solo te faltan 2 días. ¡Sigue así!',
        },
        {
          title: '¡Alerta de Racha: {milestone} Días! 🔥',
          body: '¡2 días más hasta alcanzar este hito!',
        },
        {
          title: '¡Cerca de tu Meta de {milestone} Días! 💪',
          body: '¡No rompas tu racha ahora - faltan 2 días!',
        },
        {
          title: '¡Logro Desbloqueándose Pronto! 🏆',
          body: '¡Tu racha de {milestone} días está a solo 2 días!',
        },
        {
          title: 'Racha de {milestone} Días Cargando... ⏳',
          body: '¡Casi ahí! ¡Solo 2 días más!',
        },
        {
          title: '¡Verificación de Racha: {milestone} Días Pronto! 📈',
          body: '¡Mantente constante por 2 días más!',
        },
        {
          title: '¡Gran Hito Adelante! 🌟',
          body: '¡Tu racha de {milestone} días está a 2 días!',
        },
        {
          title: '¡Victoria a la Vista! 🎉',
          body: '¡Sigue así por tu logro de {milestone} días!',
        },
        {
          title: '¡2 Días para tu Meta de {milestone} Días! 🚀',
          body: '¡Mantente en el camino para este hito de racha!',
        },
      ],
    },
    dailyUpdate: {
      morning: {
        noHabits: [
          {
            title: '¡Recordatorio Matutino! ☀️',
            body: '¡Crea tu primer hábito hoy!',
          },
          {
            title: '¡Nuevo Comienzo! 🌱',
            body: 'Agrega un hábito para construir tu rutina.',
          },
          {
            title: '¡Nuevo Día, Nuevos Hábitos! 🌟',
            body: 'Comienza tu viaje hoy.',
          },
          {
            title: '¡Buenos Días! ☕',
            body: '¿Listo para agregar tu primer hábito?',
          },
          {
            title: '¡Levántate y Brilla! 🌞',
            body: 'Hora de crear hábitos saludables.',
          },
        ],
        hasHabits: [
          {
            title: '¡Check-in Matutino! ☀️',
            body: '¡Hora de tus hábitos diarios!',
          },
          { title: '¡Vamos! 🚀', body: 'Tus hábitos te están esperando.' },
          {
            title: '¡Día Fresco Por Delante! 💫',
            body: '¿Listo para abordar tus hábitos?',
          },
          {
            title: '¡Levántate y Prospera! 🌞',
            body: '¡Marca esos hábitos hoy!',
          },
          {
            title: '¡Buenos Días! ☕',
            body: 'Los hábitos construyen el éxito. ¡Comienza ahora!',
          },
        ],
      },
      evening: {
        complete: [
          {
            title: '¡Día Perfecto! 🏆',
            body: '¡Todos los hábitos completos! ¡Trabajo increíble!',
          },
          {
            title: '¡Impecable! 🎯',
            body: '¡Terminaste todos tus hábitos hoy!',
          },
          { title: '¡Campeón! 🥇', body: '100% completo. ¡Trabajo increíble!' },
          {
            title: '¡Éxito! ✅',
            body: 'Todos los hábitos hechos. ¡Siente el progreso!',
          },
          {
            title: '¡Día Estelar! 🌟',
            body: '¡Completado totalmente! ¡Sigue así!',
          },
        ],
        mediumProgress: [
          {
            title: '¡A Medio Camino! 🚀',
            body: '{count}/{total} hábitos hechos hoy!',
          },
          {
            title: '¡Buen Progreso! 👍',
            body: '{count} hechos, {remaining} por hacer.',
          },
          {
            title: '¡Sigue Así! 💯',
            body: '¡Has hecho la mitad de tus hábitos!',
          },
          {
            title: '¡Check de Medio Día! ⏱️',
            body: '¡{count} hechos, {remaining} por hacer!',
          },
          {
            title: '¡Buen Comienzo! 👊',
            body: '¡Mitad completa! ¡Termina fuerte!',
          },
        ],
        lowProgress: [
          {
            title: '¡Comenzaste Hoy! 🌱',
            body: '{count} hábito(s) hecho(s), más por hacer!',
          },
          {
            title: '¡Sigue Así! 👣',
            body: '{count} hechos, {remaining} por completar!',
          },
          {
            title: '¡Actualización de Progreso! 📊',
            body: '{count}/{total} hábitos completos.',
          },
          {
            title: '¡Verificación de Tiempo! ⏰',
            body: '¡Aún hay tiempo para completar más hábitos!',
          },
          { title: '¡Has Comenzado! 🚀', body: '¡Continúa tu progreso hoy!' },
        ],
        noProgress: [
          {
            title: '¡Hábitos Esperando! ⏰',
            body: '¡Aún hay tiempo para hacer progreso hoy!',
          },
          {
            title: '¡Hora de Check-in! 📝',
            body: '¡Comienza un hábito antes de que termine el día!',
          },
          {
            title: '¡Recordatorio! 🔔',
            body: 'Tus hábitos necesitan atención hoy.',
          },
          {
            title: '¡Actualización Nocturna! 🌙',
            body: '¡Completa un hábito antes de dormir!',
          },
          {
            title: '¡No Es Muy Tarde! ✨',
            body: '¡Unos minutos pueden hacer la diferencia!',
          },
        ],
      },
    },
    habits: {
      templates: [
        {
          title: 'Hora de {habit} ✨',
          body: '¡Unos minutos ahora harán tu día mejor!',
        },
        {
          title: '¡Hora de {habit}! ⏰',
          body: '¿Sesión rápida? ¡Tu racha te está esperando!',
        },
        {
          title: '{habit} Ahora! 💪',
          body: 'Tu yo futuro te agradecerá por esto.',
        },
        {
          title: '¡No Te Pierdas {habit}! 🔥',
          body: 'Tu racha está en juego. ¡Abre ahora!',
        },
        {
          title: '¡Desafío de {habit}! 🏆',
          body: '¿Puedes completar esto hoy? ¡Tú puedes!',
        },
        {
          title: 'Recordatorio de {habit} ✓',
          body: 'Toca para rastrear tu progreso ahora.',
        },
        {
          title: '{habit} Time! 🚀',
          body: 'Pasos pequeños, gran progreso. ¡Vamos!',
        },
        {
          title: 'Keep Going with {habit}! 📈',
          body: 'Consistencia gana! Abre para continuar tu racha.',
        },
      ],
    },
  },
  fr: {
    streak: {
      templates: [
        {
          title: 'Presque {milestone} Jours de Série ! 🎯',
          body: 'Plus que 2 jours pour atteindre ce jalon !',
        },
        {
          title: 'Série de {milestone} Jours Approche ! ✨',
          body: 'Il ne vous reste que 2 jours. Continuez !',
        },
        {
          title: 'Alerte Série : {milestone} Jours ! 🔥',
          body: "2 jours de plus jusqu'à ce jalon !",
        },
        {
          title: 'Proche de Votre Objectif {milestone} Jours ! 💪',
          body: 'Ne cassez pas votre série maintenant - 2 jours restants !',
        },
        {
          title: 'Succès Bientôt Débloqué ! 🏆',
          body: "Votre série de {milestone} jours n'est qu'à 2 jours !",
        },
        {
          title: 'Série de {milestone} Jours en Cours... ⏳',
          body: 'Presque là ! Plus que 2 jours !',
        },
        {
          title: 'Vérification Série : {milestone} Jours Bientôt ! 📈',
          body: 'Restez constant pendant 2 jours de plus !',
        },
        {
          title: 'Grand Jalon Devant ! 🌟',
          body: 'Votre série de {milestone} jours est à 2 jours !',
        },
        {
          title: 'Victoire en Vue ! 🎉',
          body: 'Continuez pour votre succès de {milestone} jours !',
        },
        {
          title: '2 Jours pour Votre Objectif {milestone} Jours ! 🚀',
          body: 'Restez sur la bonne voie pour ce jalon !',
        },
      ],
    },
    dailyUpdate: {
      morning: {
        noHabits: [
          {
            title: 'Rappel Matinal ! ☀️',
            body: "Créez votre première habitude aujourd'hui !",
          },
          {
            title: 'Nouveau Départ ! 🌱',
            body: 'Ajoutez une habitude pour construire votre routine.',
          },
          {
            title: 'Nouveau Jour, Nouvelles Habitudes ! 🌟',
            body: "Commencez votre voyage aujourd'hui.",
          },
          {
            title: 'Bonjour ! ☕',
            body: 'Prêt à ajouter votre première habitude ?',
          },
          {
            title: 'Levez-vous et Brillez ! 🌞',
            body: 'Il est temps de créer des habitudes saines.',
          },
        ],
        hasHabits: [
          {
            title: 'Check-in Matinal ! ☀️',
            body: "C'est l'heure de vos habitudes quotidiennes !",
          },
          { title: 'Allons-y ! 🚀', body: 'Vos habitudes vous attendent.' },
          {
            title: 'Journée Fraîche Devant ! 💫',
            body: 'Prêt à aborder vos habitudes ?',
          },
          {
            title: 'Levante et Prospérez ! 🌞',
            body: "Cochez ces habitudes aujourd'hui !",
          },
          {
            title: 'Bonjour ! ☕',
            body: 'Les habitudes construisent le succès. Commencez maintenant !',
          },
        ],
      },
      evening: {
        complete: [
          {
            title: 'Journée Parfaite ! 🏆',
            body: 'Toutes les habitudes terminées ! Travail incroyable !',
          },
          {
            title: 'Impeccable ! 🎯',
            body: "Vous avez terminé toutes vos habitudes aujourd'hui !",
          },
          {
            title: 'Champion ! 🥇',
            body: '100% terminé. Travail incroyable !',
          },
          {
            title: 'Succès ! ✅',
            body: 'Toutes les habitudes faites. Ressentez le progrès !',
          },
          {
            title: 'Journée Stellaire ! 🌟',
            body: 'Achèvement complet ! Continuez !',
          },
        ],
        mediumProgress: [
          {
            title: 'À Mi-Chemin ! 🚀',
            body: "{count}/{total} habitudes faites aujourd'hui !",
          },
          {
            title: 'Bon Progrès ! 👍',
            body: '{count} faites, {remaining} à faire.',
          },
          {
            title: 'Continuez ! 💯',
            body: 'Vous avez fait la moitié de vos habitudes !',
          },
          {
            title: 'Vérification Mi-Journée ! ⏱️',
            body: '{count} faites, {remaining} à faire !',
          },
          {
            title: 'Bon Début ! 👊',
            body: 'Moitié terminée ! Finissez fort !',
          },
        ],
        lowProgress: [
          {
            title: "Commencé Aujourd'hui ! 🌱",
            body: '{count} habitude(s) faite(s), plus à faire !',
          },
          {
            title: 'Continuez ! 👣',
            body: '{count} faites, {remaining} à terminer !',
          },
          {
            title: 'Mise à Jour Progrès ! 📊',
            body: '{count}/{total} habitudes terminées.',
          },
          {
            title: 'Vérification Temps ! ⏰',
            body: "Il est encore temps de terminer plus d'habitudes !",
          },
          {
            title: 'Vous Avez Commencé ! 🚀',
            body: "Continuez votre progrès aujourd'hui !",
          },
        ],
        noProgress: [
          {
            title: 'Habitudes en Attente ! ⏰',
            body: "Il est encore temps de faire des progrès aujourd'hui !",
          },
          {
            title: 'Heure de Check-in ! 📝',
            body: 'Commencez une habitude avant la fin de la journée !',
          },
          {
            title: 'Rappel ! 🔔',
            body: "Vos habitudes ont besoin d'attention aujourd'hui.",
          },
          {
            title: 'Mise à Jour Soirée ! 🌙',
            body: 'Terminez une habitude avant de dormir !',
          },
          {
            title: 'Pas Trop Tard ! ✨',
            body: 'Quelques minutes peuvent faire la différence !',
          },
        ],
      },
    },
    habits: {
      templates: [
        {
          title: 'Heure de {habit} ✨',
          body: 'Quelques minutes maintenant rendront votre journée meilleure !',
        },
        {
          title: 'Heure pour {habit} ! ⏰',
          body: 'Session rapide ? Votre série vous attend !',
        },
        {
          title: '{habit} Maintenant ! 💪',
          body: 'Votre futur vous remerciera pour cela.',
        },
        {
          title: 'Ne Ratez Pas {habit} ! 🔥',
          body: 'Votre série est en jeu. Ouvrez maintenant !',
        },
        {
          title: 'Défi {habit} ! 🏆',
          body: "Pouvez-vous terminer cela aujourd'hui ? Vous pouvez le faire !",
        },
        {
          title: 'Rappel {habit} ✓',
          body: 'Appuyez pour suivre votre progrès maintenant.',
        },
        {
          title: 'Heure de {habit} ! 🚀',
          body: 'Petits pas, grand progrès. Allons-y !',
        },
        {
          title: 'Continuez avec {habit} ! 📈',
          body: 'La constance gagne ! Ouvrez pour continuer votre série.',
        },
      ],
    },
  },
  de: {
    streak: {
      templates: [
        {
          title: 'Fast {milestone}-Tage-Serie! 🎯',
          body: 'Nur noch 2 Tage bis zu diesem Meilenstein!',
        },
        {
          title: '{milestone}-Tage-Serie Nähert Sich! ✨',
          body: 'Du bist nur 2 Tage entfernt. Mach weiter!',
        },
        {
          title: 'Serie-Alarm: {milestone} Tage! 🔥',
          body: '2 weitere Tage bis zu diesem Meilenstein!',
        },
        {
          title: 'Nah an Deinem {milestone}-Tage-Ziel! 💪',
          body: 'Brich deine Serie jetzt nicht - 2 Tage zu gehen!',
        },
        {
          title: 'Erfolg Bald Freigeschaltet! 🏆',
          body: 'Deine {milestone}-Tage-Serie ist nur 2 Tage entfernt!',
        },
        {
          title: '{milestone}-Tage-Serie Lädt... ⏳',
          body: 'Fast da! Nur noch 2 Tage!',
        },
        {
          title: 'Serie-Check: {milestone} Tage Bald! 📈',
          body: 'Bleib konstant für 2 weitere Tage!',
        },
        {
          title: 'Großer Meilenstein Voraus! 🌟',
          body: 'Deine {milestone}-Tage-Serie ist 2 Tage entfernt!',
        },
        {
          title: 'Sieg in Sicht! 🎉',
          body: 'Mach weiter für deinen {milestone}-Tage-Erfolg!',
        },
        {
          title: '2 Tage zu Deinem {milestone}-Tage-Ziel! 🚀',
          body: 'Bleib auf Kurs für diesen Serie-Meilenstein!',
        },
      ],
    },
    dailyUpdate: {
      morning: {
        noHabits: [
          {
            title: 'Morgen-Erinnerung! ☀️',
            body: 'Erstelle heute deine erste Gewohnheit!',
          },
          {
            title: 'Neuer Start! 🌱',
            body: 'Füge eine Gewohnheit hinzu, um deine Routine aufzubauen.',
          },
          {
            title: 'Neuer Tag, Neue Gewohnheiten! 🌟',
            body: 'Starte heute deine Reise.',
          },
          {
            title: 'Guten Morgen! ☕',
            body: 'Bereit, deine erste Gewohnheit hinzuzufügen?',
          },
          {
            title: 'Aufstehen und Strahlen! 🌞',
            body: 'Zeit, gesunde Gewohnheiten zu schaffen.',
          },
        ],
        hasHabits: [
          {
            title: 'Morgen-Check-in! ☀️',
            body: 'Zeit für deine täglichen Gewohnheiten!',
          },
          {
            title: "Los geht's! 🚀",
            body: 'Deine Gewohnheiten warten auf dich.',
          },
          {
            title: 'Frischer Tag Voraus! 💫',
            body: 'Bereit, deine Gewohnheiten anzugehen?',
          },
          {
            title: 'Aufstehen und Gedeihen! 🌞',
            body: 'Hake diese Gewohnheiten heute ab!',
          },
          {
            title: 'Guten Morgen! ☕',
            body: 'Gewohnheiten schaffen Erfolg. Fang jetzt an!',
          },
        ],
      },
      evening: {
        complete: [
          {
            title: 'Perfekter Tag! 🏆',
            body: 'Alle Gewohnheiten abgeschlossen! Erstaunliche Arbeit!',
          },
          {
            title: 'Makellos! 🎯',
            body: 'Du hast heute alle deine Gewohnheiten beendet!',
          },
          {
            title: 'Champion! 🥇',
            body: '100% abgeschlossen. Unglaubliche Arbeit!',
          },
          {
            title: 'Erfolg! ✅',
            body: 'Alle Gewohnheiten erledigt. Spüre den Fortschritt!',
          },
          {
            title: 'Stellarer Tag! 🌟',
            body: 'Vollständige Fertigstellung! Mach weiter!',
          },
        ],
        mediumProgress: [
          {
            title: 'Halbzeit! 🚀',
            body: '{count}/{total} Gewohnheiten heute geschafft!',
          },
          {
            title: 'Guter Fortschritt! 👍',
            body: '{count} geschafft, {remaining} zu gehen.',
          },
          {
            title: 'Mach Weiter! 💯',
            body: 'Du hast die Hälfte deiner Gewohnheiten geschafft!',
          },
          {
            title: 'Mittags-Check! ⏱️',
            body: '{count} geschafft, {remaining} zu gehen!',
          },
          { title: 'Solider Start! 👊', body: 'Hälfte fertig! Stark beenden!' },
        ],
        lowProgress: [
          {
            title: 'Heute Begonnen! 🌱',
            body: '{count} Gewohnheit(en) geschafft, mehr zu tun!',
          },
          {
            title: 'Mach Weiter! 👣',
            body: '{count} geschafft, {remaining} zu beenden!',
          },
          {
            title: 'Fortschritts-Update! 📊',
            body: '{count}/{total} Gewohnheiten abgeschlossen.',
          },
          {
            title: 'Zeit-Check! ⏰',
            body: 'Noch Zeit, mehr Gewohnheiten zu beenden!',
          },
          {
            title: 'Du Hast Begonnen! 🚀',
            body: 'Setze deinen Fortschritt heute fort!',
          },
        ],
        noProgress: [
          {
            title: 'Gewohnheiten Warten! ⏰',
            body: 'Noch Zeit, heute Fortschritte zu machen!',
          },
          {
            title: 'Check-in Zeit! 📝',
            body: 'Starte eine Gewohnheit vor Tagesende!',
          },
          {
            title: 'Erinnerung! 🔔',
            body: 'Deine Gewohnheiten brauchen heute Aufmerksamkeit.',
          },
          {
            title: 'Abend-Update! 🌙',
            body: 'Beende eine Gewohnheit vor dem Schlafengehen!',
          },
          {
            title: 'Nicht Zu Spät! ✨',
            body: 'Ein paar Minuten können den Unterschied machen!',
          },
        ],
      },
    },
    habits: {
      templates: [
        {
          title: '{habit} Zeit ✨',
          body: 'Ein paar Minuten jetzt werden deinen Tag besser machen!',
        },
        {
          title: 'Zeit für {habit}! ⏰',
          body: 'Kurze Session? Deine Serie wartet!',
        },
        {
          title: '{habit} Jetzt! 💪',
          body: 'Dein zukünftiges Ich wird dir dafür danken.',
        },
        {
          title: 'Verpasse {habit} Nicht! 🔥',
          body: 'Deine Serie steht auf dem Spiel. Öffne jetzt!',
        },
        {
          title: '{habit} Herausforderung! 🏆',
          body: 'Kannst du das heute schaffen? Du schaffst das!',
        },
        {
          title: '{habit} Erinnerung ✓',
          body: 'Tippe, um deinen Fortschritt jetzt zu verfolgen.',
        },
        {
          title: '{habit} Zeit! 🚀',
          body: "Kleine Schritte, großer Fortschritt. Los geht's!",
        },
        {
          title: 'Mach Weiter mit {habit}! 📈',
          body: 'Konstanz gewinnt! Öffne, um deine Serie fortzusetzen.',
        },
      ],
    },
  },
  pt: {
    streak: {
      templates: [
        {
          title: 'Quase {milestone} Dias de Sequência! 🎯',
          body: 'Apenas mais 2 dias para alcançar este marco!',
        },
        {
          title: 'Sequência de {milestone} Dias Aproximando! ✨',
          body: 'Você está a apenas 2 dias. Continue assim!',
        },
        {
          title: 'Alerta de Sequência: {milestone} Dias! 🔥',
          body: 'Mais 2 dias até este marco!',
        },
        {
          title: 'Perto da Sua Meta de {milestone} Dias! 💪',
          body: 'Não quebre sua sequência agora - 2 dias restantes!',
        },
        {
          title: 'Conquista Desbloqueando Em Breve! 🏆',
          body: 'Sua sequência de {milestone} dias está a apenas 2 dias!',
        },
        {
          title: 'Sequência de {milestone} Dias Carregando... ⏳',
          body: 'Quase lá! Apenas mais 2 dias!',
        },
        {
          title: 'Verificação de Sequência: {milestone} Dias Em Breve! 📈',
          body: 'Mantenha-se consistente por mais 2 dias!',
        },
        {
          title: 'Grande Marco À Frente! 🌟',
          body: 'Sua sequência de {milestone} dias está a 2 dias!',
        },
        {
          title: 'Vitória À Vista! 🎉',
          body: 'Continue assim pela sua conquista de {milestone} dias!',
        },
        {
          title: '2 Dias Para Sua Meta de {milestone} Dias! 🚀',
          body: 'Mantenha-se no caminho para este marco de sequência!',
        },
      ],
    },
    dailyUpdate: {
      morning: {
        noHabits: [
          {
            title: 'Lembrete Matinal! ☀️',
            body: 'Crie seu primeiro hábito hoje!',
          },
          {
            title: 'Novo Começo! 🌱',
            body: 'Adicione um hábito para construir sua rotina.',
          },
          {
            title: 'Novo Dia, Novos Hábitos! 🌟',
            body: 'Comece sua jornada hoje.',
          },
          {
            title: 'Bom Dia! ☕',
            body: 'Pronto para adicionar seu primeiro hábito?',
          },
          {
            title: 'Levante e Brilhe! 🌞',
            body: 'Hora de criar hábitos saudáveis.',
          },
        ],
        hasHabits: [
          {
            title: 'Check-in Matinal! ☀️',
            body: 'Hora dos seus hábitos diários!',
          },
          {
            title: 'Vamos Lá! 🚀',
            body: 'Seus hábitos estão esperando por você.',
          },
          {
            title: 'Dia Fresco Pela Frente! 💫',
            body: 'Pronto para enfrentar seus hábitos?',
          },
          {
            title: 'Levante e Prospere! 🌞',
            body: 'Marque esses hábitos hoje!',
          },
          {
            title: 'Bom Dia! ☕',
            body: 'Hábitos constroem sucesso. Comece agora!',
          },
        ],
      },
      evening: {
        complete: [
          {
            title: 'Dia Perfeito! 🏆',
            body: 'Todos os hábitos completos! Trabalho incrível!',
          },
          {
            title: 'Impecável! 🎯',
            body: 'Você terminou todos os seus hábitos hoje!',
          },
          { title: 'Campeão! 🥇', body: '100% completo. Trabalho incrível!' },
          {
            title: 'Sucesso! ✅',
            body: 'Todos os hábitos feitos. Sinta o progresso!',
          },
          {
            title: 'Dia Estelar! 🌟',
            body: 'Conclusão completa! Continue assim!',
          },
        ],
        mediumProgress: [
          {
            title: 'No Meio do Caminho! 🚀',
            body: '{count}/{total} hábitos feitos hoje!',
          },
          {
            title: 'Bom Progresso! 👍',
            body: '{count} feitos, {remaining} restantes.',
          },
          {
            title: 'Continue Assim! 💯',
            body: 'Você fez metade dos seus hábitos!',
          },
          {
            title: 'Check do Meio-Dia! ⏱️',
            body: '{count} feitos, {remaining} restantes!',
          },
          {
            title: 'Início Sólido! 👊',
            body: 'Metade completa! Termine forte!',
          },
        ],
        lowProgress: [
          {
            title: 'Começou Hoje! 🌱',
            body: '{count} hábito(s) feito(s), mais para fazer!',
          },
          {
            title: 'Continue Assim! 👣',
            body: '{count} feitos, {remaining} para completar!',
          },
          {
            title: 'Atualização de Progresso! 📊',
            body: '{count}/{total} hábitos completos.',
          },
          {
            title: 'Verificação de Tempo! ⏰',
            body: 'Ainda há tempo para completar mais hábitos!',
          },
          { title: 'Você Começou! 🚀', body: 'Continue seu progresso hoje!' },
        ],
        noProgress: [
          {
            title: 'Hábitos Esperando! ⏰',
            body: 'Ainda há tempo para fazer progresso hoje!',
          },
          {
            title: 'Hora do Check-in! 📝',
            body: 'Comece um hábito antes do fim do dia!',
          },
          {
            title: 'Lembrete! 🔔',
            body: 'Seus hábitos precisam de atenção hoje.',
          },
          {
            title: 'Atualização Noturna! 🌙',
            body: 'Complete um hábito antes de dormir!',
          },
          {
            title: 'Não É Muito Tarde! ✨',
            body: 'Alguns minutos podem fazer a diferença!',
          },
        ],
      },
    },
    habits: {
      templates: [
        {
          title: 'Hora do {habit} ✨',
          body: 'Alguns minutos agora tornarão seu dia melhor!',
        },
        {
          title: 'Hora para {habit}! ⏰',
          body: 'Sessão rápida? Sua sequência está esperando!',
        },
        {
          title: '{habit} Agora! 💪',
          body: 'Seu eu futuro agradecerá por isso.',
        },
        {
          title: 'Não Perca {habit}! 🔥',
          body: 'Sua sequência está em jogo. Abra agora!',
        },
        {
          title: 'Desafio {habit}! 🏆',
          body: 'Consegue completar isso hoje? Você consegue!',
        },
        {
          title: 'Lembrete {habit} ✓',
          body: 'Toque para acompanhar seu progresso agora.',
        },
        {
          title: 'Hora do {habit}! 🚀',
          body: 'Pequenos passos, grande progresso. Vamos lá!',
        },
        {
          title: 'Continue com {habit}! 📈',
          body: 'Consistência vence! Abra para continuar sua sequência.',
        },
      ],
    },
  },
  ru: {
    streak: {
      templates: [
        {
          title: 'Почти {milestone} Дней Подряд! 🎯',
          body: 'Всего 2 дня до этой вехи!',
        },
        {
          title: 'Серия {milestone} Дней Приближается! ✨',
          body: 'Вы всего в 2 днях. Продолжайте!',
        },
        {
          title: 'Тревога Серии: {milestone} Дней! 🔥',
          body: 'Еще 2 дня до этой вехи!',
        },
        {
          title: 'Близко к Вашей Цели {milestone} Дней! 💪',
          body: 'Не прерывайте серию сейчас - осталось 2 дня!',
        },
        {
          title: 'Достижение Скоро Разблокируется! 🏆',
          body: 'Ваша серия {milestone} дней всего в 2 днях!',
        },
        {
          title: 'Серия {milestone} Дней Загружается... ⏳',
          body: 'Почти там! Всего 2 дня!',
        },
        {
          title: 'Проверка Серии: {milestone} Дней Скоро! 📈',
          body: 'Оставайтесь последовательными еще 2 дня!',
        },
        {
          title: 'Большая Веха Впереди! 🌟',
          body: 'Ваша серия {milestone} дней в 2 днях!',
        },
        {
          title: 'Победа На Горизонте! 🎉',
          body: 'Продолжайте для вашего достижения {milestone} дней!',
        },
        {
          title: '2 Дня До Вашей Цели {milestone} Дней! 🚀',
          body: 'Оставайтесь на пути к этой вехе серии!',
        },
      ],
    },
    dailyUpdate: {
      morning: {
        noHabits: [
          {
            title: 'Утреннее Напоминание! ☀️',
            body: 'Создайте свою первую привычку сегодня!',
          },
          {
            title: 'Новое Начало! 🌱',
            body: 'Добавьте привычку для построения рутины.',
          },
          {
            title: 'Новый День, Новые Привычки! 🌟',
            body: 'Начните свое путешествие сегодня.',
          },
          {
            title: 'Доброе Утро! ☕',
            body: 'Готовы добавить свою первую привычку?',
          },
          {
            title: 'Вставайте и Сияйте! 🌞',
            body: 'Время создавать здоровые привычки.',
          },
        ],
        hasHabits: [
          {
            title: 'Утренняя Проверка! ☀️',
            body: 'Время для ваших ежедневных привычек!',
          },
          { title: 'Поехали! 🚀', body: 'Ваши привычки ждут вас.' },
          {
            title: 'Свежий День Впереди! 💫',
            body: 'Готовы заняться своими привычками?',
          },
          {
            title: 'Вставайте и Процветайте! 🌞',
            body: 'Отметьте эти привычки сегодня!',
          },
          {
            title: 'Доброе Утро! ☕',
            body: 'Привычки строят успех. Начинайте сейчас!',
          },
        ],
      },
      evening: {
        complete: [
          {
            title: 'Идеальный День! 🏆',
            body: 'Все привычки выполнены! Потрясающая работа!',
          },
          {
            title: 'Безупречно! 🎯',
            body: 'Вы завершили все свои привычки сегодня!',
          },
          { title: 'Чемпион! 🥇', body: '100% выполнено. Невероятная работа!' },
          {
            title: 'Успех! ✅',
            body: 'Все привычки сделаны. Почувствуйте прогресс!',
          },
          {
            title: 'Звездный День! 🌟',
            body: 'Полное завершение! Продолжайте!',
          },
        ],
        mediumProgress: [
          {
            title: 'На Полпути! 🚀',
            body: '{count}/{total} привычек сделано сегодня!',
          },
          {
            title: 'Хороший Прогресс! 👍',
            body: '{count} сделано, {remaining} осталось.',
          },
          {
            title: 'Продолжайте! 💯',
            body: 'Вы сделали половину своих привычек!',
          },
          {
            title: 'Проверка Середины Дня! ⏱️',
            body: '{count} сделано, {remaining} осталось!',
          },
          {
            title: 'Твердое Начало! 👊',
            body: 'Половина готова! Финишируйте сильно!',
          },
        ],
        lowProgress: [
          {
            title: 'Начали Сегодня! 🌱',
            body: '{count} привычка(и) сделана, больше предстоит!',
          },
          {
            title: 'Продолжайте! 👣',
            body: '{count} сделано, {remaining} для завершения!',
          },
          {
            title: 'Обновление Прогресса! 📊',
            body: '{count}/{total} привычек завершено.',
          },
          {
            title: 'Проверка Времени! ⏰',
            body: 'Еще есть время завершить больше привычек!',
          },
          {
            title: 'Вы Начали! 🚀',
            body: 'Продолжайте свой прогресс сегодня!',
          },
        ],
        noProgress: [
          {
            title: 'Привычки Ждут! ⏰',
            body: 'Еще есть время для прогресса сегодня!',
          },
          {
            title: 'Время Проверки! 📝',
            body: 'Начните привычку до конца дня!',
          },
          {
            title: 'Напоминание! 🔔',
            body: 'Ваши привычки нуждаются во внимании сегодня.',
          },
          {
            title: 'Вечернее Обновление! 🌙',
            body: 'Завершите привычку перед сном!',
          },
          {
            title: 'Не Слишком Поздно! ✨',
            body: 'Несколько минут могут изменить все!',
          },
        ],
      },
    },
    habits: {
      templates: [
        {
          title: 'Время {habit} ✨',
          body: 'Несколько минут сейчас сделают ваш день лучше!',
        },
        {
          title: 'Время для {habit}! ⏰',
          body: 'Быстрая сессия? Ваша серия ждет!',
        },
        {
          title: '{habit} Сейчас! 💪',
          body: 'Ваше будущее я поблагодарит вас за это.',
        },
        {
          title: 'Не Пропустите {habit}! 🔥',
          body: 'Ваша серия на кону. Откройте сейчас!',
        },
        {
          title: 'Вызов {habit}! 🏆',
          body: 'Сможете завершить это сегодня? У вас получится!',
        },
        {
          title: 'Напоминание {habit} ✓',
          body: 'Нажмите, чтобы отследить прогресс сейчас.',
        },
        {
          title: 'Время {habit}! 🚀',
          body: 'Маленькие шаги, большой прогресс. Поехали!',
        },
        {
          title: 'Продолжайте с {habit}! 📈',
          body: 'Постоянство побеждает! Откройте, чтобы продолжить серию.',
        },
      ],
    },
  },
};
