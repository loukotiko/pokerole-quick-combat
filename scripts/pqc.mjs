import { PQC } from "./utils.mjs";
import { setupSettings } from "./settings.mjs";

function refresh() {
  PQC.token = canvas.tokens.controlled[0];
  const selected = !!PQC.token;
  const hasCombat = game.combat;
  const combatStarted = hasCombat && game.combat.round > 0;
  const tokenInCombat =
    hasCombat &&
    game.combat.combatants.some(
      (combatant) => combatant.actorId === PQC.token?.actor._id
    );

  if (selected && combatStarted && tokenInCombat) PQC.dialog.render(true);
  else PQC.dialog.close();
}

Hooks.once("init", async function () {
  await setupSettings();
  PQC.log("Hook.init");
  PQC.log("Settings created!");

  PQC.initializeTemplatesAndDialogs();
  PQC.log("Initialized templates and dialogs!");

  // Override game.PokeroleItem _onChatCardAction pour pouvoir rajouter un hook
  const defaultOnChatCardAction = game.pokerole.PokeroleItem._onChatCardAction;
  game.pokerole.PokeroleItem._onChatCardAction = async function (event) {
    PQC.log("PokeroleItem._onChatCardAction");
    await defaultOnChatCardAction.bind(game.pokerole.PokeroleItem)(event);
    setTimeout(refresh, 200);
  };
});

function onChatActionClick() {
  setTimeout(refresh, 200);
}

Hooks.once("ready", async function () {
  PQC.log("Hook.ready");

  // Add a refresh after chat action click
  $("body").on("click", "button.chat-action", onChatActionClick);
});

Hooks.on("combatStart", async (...args) => {
  PQC.log("Hook.combatStart");
  PQC.dialog.render(true);
  console.log({ args });
});

Hooks.on("combatRound", async () => {
  PQC.log("Hook.combatRound");
  // Timeout to let control token be applied before checking controlled tokens
  setTimeout(refresh, 200);
});

Hooks.on("combatTurn", async () => {
  PQC.log("Hook.combatTurn");
});

Hooks.on("combatTurnChange", async () => {
  PQC.log("Hook.combatTurnChange");
});

Hooks.on("canvasDraw", async () => {
  PQC.log("Hook.canvasDraw");
});

Hooks.on("highlightObjects", async () => {
  PQC.log("Hook.highlightObjects");
});

Hooks.on("controlToken", async () => {
  PQC.log("Hook.controlToken");
  // Timeout to let control token be applied before checking controlled tokens
  setTimeout(refresh);
});

Hooks.on("renderActorSheet", async (actorSheet, html, data) => {
  PQC.log("Hook.renderActorSheet");
  if (data.actor._id === PQC.token?.actor._id) refresh();
});
