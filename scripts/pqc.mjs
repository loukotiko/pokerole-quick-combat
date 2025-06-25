import { PQC } from "./utils.mjs";
import { setupSettings } from "./settings.mjs";
import "./pqcWill.mjs";

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

  // Override game.PokeroleItem _onChatCardAction to add data to messages
  const defaultOnChatCardAction = game.pokerole.PokeroleItem._onChatCardAction;
  game.pokerole.PokeroleItem._onChatCardAction = async function (event) {
    PQC.log("PokeroleItem._onChatCardAction");

    const button = event.currentTarget;
    const card = button.closest(".chat-card");
    const action = button.dataset.action;
    const { actor, token } = await game.pokerole.PokeroleItem._getChatCardActor(
      card
    );

    const system = {
      action,
      actor,
      token,
      ...card.dataset,
    };

    const defaultChatMessageCreate = ChatMessage.create;
    ChatMessage.create = function (data) {
      defaultChatMessageCreate.bind(ChatMessage)({ ...data, system });
    };
    await defaultOnChatCardAction.bind(game.pokerole.PokeroleItem)(event);
    ChatMessage.create = defaultChatMessageCreate;
    setTimeout(refresh, 200);
  };
});

Hooks.on("controlToken", async () => {
  PQC.log("Hook.controlToken");
  // Timeout to let control token be applied before checking controlled tokens
  setTimeout(refresh);
});
