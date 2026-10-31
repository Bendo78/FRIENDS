// Banque de questions. {p} = prénom du/de la partenaire (sur qui porte la question).
export const QUESTIONS = [
  // Rencontre
  { c: "Rencontre", q: "Dans quelle ville {p} et toi vous êtes-vous rencontrés ?" },
  { c: "Rencontre", q: "Qui a fait le premier pas : toi ou {p} ?" },
  { c: "Rencontre", q: "Qu'est-ce que {p} portait le jour de votre rencontre ?" },
  { c: "Rencontre", q: "Selon {p}, qu'est-ce qui l'a fait craquer chez toi en premier ?" },
  { c: "Rencontre", q: "Quel a été votre tout premier rendez-vous, d'après {p} ?" },
  { c: "Rencontre", q: "Quel surnom {p} te donne le plus souvent ?" },
  // Goûts
  { c: "Goûts", q: "Quel est le plat préféré de {p} ?" },
  { c: "Goûts", q: "Quelle est la chanson que {p} chante le plus sous la douche ?" },
  { c: "Goûts", q: "Quel film {p} pourrait regarder dix fois sans se lasser ?" },
  { c: "Goûts", q: "Si {p} devait partir demain en vacances, ce serait où ?" },
  { c: "Goûts", q: "Quelle est la boisson préférée de {p} en soirée ?" },
  { c: "Goûts", q: "Quel animal {p} rêverait d'avoir ?" },
  { c: "Goûts", q: "Quelle célébrité {p} trouve la plus craquante ?" },
  { c: "Goûts", q: "Sucré ou salé : que choisit {p} au petit-déjeuner ?" },
  // Quotidien
  { c: "Quotidien", q: "Qui de toi ou {p} met le plus de temps à se préparer ?" },
  { c: "Quotidien", q: "Quelle tâche ménagère {p} déteste le plus ?" },
  { c: "Quotidien", q: "De quel côté du lit dort {p} ?" },
  { c: "Quotidien", q: "Quelle est la première chose que fait {p} en se réveillant ?" },
  { c: "Quotidien", q: "Combien de fois {p} appuie sur « snooze » le matin ?" },
  { c: "Quotidien", q: "Quelle appli {p} ouvre le plus sur son téléphone ?" },
  { c: "Quotidien", q: "Qui conduit le mieux d'après {p} : toi ou lui/elle ?" },
  { c: "Quotidien", q: "Quel est le plat que {p} cuisine le mieux ?" },
  // Défauts & manies
  { c: "Défauts", q: "Quel est le pire défaut de {p} ?" },
  { c: "Défauts", q: "Quelle manie de toi agace le plus {p} ?" },
  { c: "Défauts", q: "Pour quoi {p} peut bouder pendant des heures ?" },
  { c: "Défauts", q: "Quel est le dernier gros mensonge que {p} t'a avoué ?" },
  { c: "Défauts", q: "Qu'est-ce que {p} oublie tout le temps ?" },
  { c: "Défauts", q: "Qui de toi ou {p} dit « pardon » en premier après une dispute ?" },
  // Petits secrets
  { c: "Secrets", q: "Quelle est la plus grande peur de {p} ?" },
  { c: "Secrets", q: "Quel métier {p} rêvait de faire enfant ?" },
  { c: "Secrets", q: "Quel est le cadeau que tu as offert et que {p} a le moins aimé ?" },
  { c: "Secrets", q: "Quel est le plaisir coupable de {p} ?" },
  { c: "Secrets", q: "Quel est le moment le plus gênant que {p} a vécu avec toi ?" },
  { c: "Secrets", q: "De quoi {p} est le plus fier ou fière ?" },
  { c: "Secrets", q: "Qu'est-ce qui fait pleurer {p} à coup sûr ?" },
  // Avenir
  { c: "Avenir", q: "Combien d'enfants {p} voudrait avoir ?" },
  { c: "Avenir", q: "Où {p} rêve de vivre dans dix ans ?" },
  { c: "Avenir", q: "Si {p} gagnait au loto, quel serait son premier achat ?" },
  { c: "Avenir", q: "Quel prénom {p} adorerait donner à un enfant ?" },
  { c: "Avenir", q: "Quel est le prochain grand projet de {p} ?" },
  // Coquin (léger)
  { c: "Coquin", q: "Quelle partie de ton corps {p} préfère ?" },
  { c: "Coquin", q: "Quel est l'endroit le plus insolite où {p} t'a embrassé(e) ?" },
  { c: "Coquin", q: "Quelle tenue de toi fait le plus craquer {p} ?" },
  { c: "Coquin", q: "Quel est le parfum (ou l'odeur) que {p} adore sur toi ?" },
  { c: "Coquin", q: "Quel mot doux {p} n'ose dire qu'en privé ?" },
];

export const CATEGORIES = [...new Set(QUESTIONS.map((q) => q.c))];
export const fill = (q, p) => q.replaceAll("{p}", p || "ton/ta partenaire");
