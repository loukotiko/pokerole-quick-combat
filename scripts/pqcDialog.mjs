import { PQC } from "./utils.mjs";

export default class PQCDialog extends FormApplication {
  constructor(object) {
    super(object);
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
    html
      .off("click", ".quick-reset-move")
      .on("click", ".quick-reset-move", this._onQuickResetMove);
  }

  _onQuickResetMove(event) {
    const actor = PQC.token?.actor;
    const li = event.currentTarget.closest("li");
    const item = actor.items.get(li.dataset.itemId);
    item.update({ "system.usedInRound": !item.system.usedInRound });
  }

  /** @inheritDoc */
  async _render(force, options = {}) {
    // Parent class rendering workflow
    await super._render(force, options);

    // Register the active Application with the referenced Documents
    if (PQC.token) PQC.token.actor.apps[this.appId] = this;
  }
}
