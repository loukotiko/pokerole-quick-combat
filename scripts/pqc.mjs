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
});

Hooks.on("controlToken", async () => {
  PQC.log("Hook.controlToken");
  // Timeout to let control token be applied before checking controlled tokens
  setTimeout(refresh);
});
