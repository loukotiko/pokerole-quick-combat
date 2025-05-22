import { PQC } from "./utils.mjs";

export default class PQCDialog extends FormApplication {
  static token;
  constructor() {
    super();
  }
  static get defaultOptions() {
    const defaults = super.defaultOptions;
    const overrides = {
      height: "auto",
      width: 230,
      id: PQC.ID + "-dialog",
      classes: ["sidebar-popout"],
      template: PQC.TEMPLATES.DIALOG,
      title: "PQC.TITLE",
      userId: game.userId,
      popOut: true,
    };

    return foundry.utils.mergeObject(defaults, overrides);
  }

  get title() {
    return PQC.token?.actor.name;
  }

  async getData() {
    const actor = PQC.token?.actor;

    const context = await PQC.token?.actor.sheet.getData();
    context.actor = actor;

    const struggleMoves = context.moves.maneuver.moveList.filter((move) =>
      move.data.name.includes("Struggle")
    );
    context.quickMoves = [...context.moves.learned.moveList, ...struggleMoves];

    context.usedActions = context.system.actionCount.value - 1;
    PQC.log(context);
    return context;
  }

  activateListeners(html) {
    html
      .off("click", ".rollable")
      .on(
        "click",
        ".rollable",
        PQC.token?.actor.sheet._onRoll.bind(PQC.token?.actor.sheet)
      );
  }
}
