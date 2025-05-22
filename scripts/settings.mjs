import { PQC } from "./utils.mjs";

export async function setupSettings() {
  await game.settings.register(PQC.ID, PQC.SETTINGS.DEBUG, {
    name: "PORYPHONE.SETTINGS.DEBUG.NAME", // can also be an i18n key
    hint: "PORYPHONE.SETTINGS.DEBUG.HINT", // can also be an i18n key
    scope: "world", // "world" = sync to db, "client" = local storage
    config: true, // false if you dont want it to show in module config
    type: Boolean, // Number, Boolean, String, or even a custom class or DataModel
    default: false,
    requiresReload: true, // when changing the setting, prompt the user to reload
  });
}
