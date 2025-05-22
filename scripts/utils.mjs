import PQCDialog from "./pqcDialog.mjs";

export class PQC {
  static ID = "pokerole-quick-combat";
  static NAME = "Pokérole Quick Combat";
  static SETTINGS = PQC.createEnum(["DEBUG"], PQC.ID + "_SETTINGS_");

  static FLAGS = {
    APPS: "apps",
  };

  static TEMPLATES = {
    DIALOG: `modules/${PQC.ID}/templates/pqc-dialog.hbs`,
  };

  static log(...args) {
    const shouldLog = game.settings.get(PQC.ID, PQC.SETTINGS.DEBUG);

    if (shouldLog) {
      console.log(PQC.NAME, "|", ...args);
    }
  }

  static token;
  static dialog;
  static intervalRefresh;
  static initializeTemplatesAndDialogs() {
    PQC.dialog = new PQCDialog();
    /*    if (PQC.intervalRefresh) PQC.intervalRefresh?.clearInterval();
    PQC.intervalRefresh = setInterval(
      () => PQC.token && PQC.dialog.render(true),
      500
    );*/
    loadTemplates([PQC.TEMPLATES.BAR]);
  }

  static createEnum(keys, prefix = "") {
    return keys.reduce(
      (theEnum, key) => ({ ...theEnum, [key]: prefix + key }),
      {}
    );
  }

  static i18n = {
    types: {
      none: "PQC.TypeNone",
      normal: "PQC.TypeNormal",
      bug: "PQC.TypeBug",
      dark: "PQC.TypeDark",
      dragon: "PQC.TypeDragon",
      electric: "PQC.TypeElectric",
      fairy: "PQC.TypeFairy",
      fighting: "PQC.TypeFighting",
      fire: "PQC.TypeFire",
      flying: "PQC.TypeFlying",
      ghost: "PQC.TypeGhost",
      grass: "PQC.TypeGrass",
      ground: "PQC.TypeGround",
      ice: "PQC.TypeIce",
      poison: "PQC.TypePoison",
      psychic: "PQC.TypePsychic",
      rock: "PQC.TypeRock",
      steel: "PQC.TypeSteel",
      water: "PQC.TypeWater",
    },

    targets: {
      Foe: "PQC.TargetFoe",
      "Random Foe": "PQC.TargetRandomFoe",
      "All Foes": "PQC.TargetAllFoes",
      User: "PQC.TargetUser",
      "One Ally": "PQC.TargetAlly",
      "User and Allies": "PQC.TargetUserAndAllies",
      Area: "PQC.TargetArea",
      Battlefield: "PQC.TargetBattlefield",
      "Battlefield (Foes)": "PQC.TargetBattlefieldFoes",
      "Battlefield and Area": "PQC.TargetBattlefieldAndArea",
    },

    moveCategories: {
      physical: "PQC.MoveCategoryPhysical",
      special: "PQC.MoveCategorySpecial",
      support: "PQC.MoveCategorySupport",
    },
  };
}
