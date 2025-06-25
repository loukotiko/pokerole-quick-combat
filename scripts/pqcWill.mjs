import { PQC } from "./utils.mjs";

Hooks.on("getChatLogEntryContext", addChatMessageContextOptions);

Hooks.on("renderChatLog", (app, html) => activateListeners(html));

async function rollDice(rollCount) {
  let rolls = [];
  for (let i = 0; i < rollCount; i++) {
    let roll = await new Roll("d6").evaluate({ async: true });
    rolls.push(roll.total);
  }
  return rolls;
}

export function addChatMessageContextOptions(html, options) {
  let canApplyFocus = (li) => {
    return li.find(".roll.die.d6.selected").length > 0;
  };

  options.unshift({
    name: "Use will to reroll selected die",
    icon: '<i class="fas fa-fire"></i>',
    condition: canApplyFocus,
    callback: async (li) => {
      const message = game.messages.get(li.data("messageId"));
      const token = game.canvas.tokens.get(message.speaker.token);
      const actor = token.actor || game.actors.get(message.speaker.actor);
      const selectedDie = $(li).find(".roll.die.d6.selected").toArray();
      const count = selectedDie.length;
      const will = actor.system.will.value;

      /* reroll dices and update message */
      if (will < count) return ui.notifications.error("Not enough will!");

      const rolls = await rollDice(count);

      const indexedRolls = selectedDie.reduce(
        (indexedRolls, die, flatIndex) => ({
          ...indexedRolls,
          [[...die.parentNode.children].indexOf(die)]: rolls[flatIndex],
        }),
        {}
      );

      await updateMessage(message, {
        indexedRolls,
        token,
        actor,
      });

      await actor.update({ "system.will.value": will - count });
    },
  });
}

function activateListeners(html) {
  html.on("click", ".roll.die.d6:not(.max)", _onDiceClick);
}

function _onDiceClick(event) {
  const id = $(event.currentTarget).parents(".message").attr("data-message-id");
  const message = game.messages.get(id);
  const isSelected = $(event.currentTarget)[0].classList.contains("selected");
  const count =
    $(event.currentTarget)
      .parents("ol.dice-rolls")
      .find(".roll.die.d6.selected").length + 1;
  const token = game.canvas.tokens.get(message.speaker.token);
  const actor = token.actor || game.actors.get(message.speaker.actor);
  const will = actor.system.will.value;

  const authorizedMessage = message.system.action === "accuracy";
  const authorized = authorizedMessage && message.isAuthor;

  if (authorized) {
    if (will < count && !isSelected) ui.notifications.error("Not enough will!");
    else event.currentTarget.classList.toggle("selected");
  }
}

function updateMessage(message, data) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(message.content, "text/html").body;

  switch (message.system.action) {
    case "accuracy":
      updateAccuracyRollMessage(message, doc, data);
  }

  const newContent = doc.innerHTML;
  console.log({ newContent });
  console.log(doc);
  message.update({
    content: newContent,
  });
}

function updateAccuracyRollMessage(
  message,
  doc,
  { indexedRolls, actor, token }
) {
  const { itemId, canBeClashed, canBeEvaded } = message.system;
  const item = actor.items.get(itemId);

  const requiredSuccesses =
    +/\(([0-9]+) success(es)? required\)/gim.exec(message.content)[1] || 1;

  //  update rolls
  const docRolls = doc.querySelectorAll(".roll.die.d6");
  Object.entries(indexedRolls).forEach(([index, roll]) => {
    docRolls[index].innerText = roll;
    if (roll > 3) docRolls[index].classList.add("max");
  });

  //  update successes
  const countSuccesses = doc.querySelectorAll(".roll.die.d6.max").length;

  const docSuccesses = doc.querySelector("& > b");
  console.log({ requiredSuccesses, docSuccesses });

  docSuccesses.innerText = countSuccesses + " successes";

  // update action buttons
  let actionButtonsHtml = "";
  if (countSuccesses >= requiredSuccesses) {
    if (canBeClashed) {
      actionButtonsHtml += `<button class="chat-action" data-action="clash"
        data-attacker-id="${actor.uuid}" data-move-id="${item.uuid}" data-expected-successes="${countSuccesses}"
        >Clash</button>`;
    }
    if (canBeEvaded) {
      actionButtonsHtml += `<button class="chat-action" data-action="evade">Evade</button>`;
    }

    const dataTokenUuid = token ? `data-token-uuid="${token.uuid}"` : "";

    // Unconditional effects
    for (let effect of item.getUnconditionalEffects()) {
      html += `<button class="chat-action" data-action="applyEffect" data-actor-id="${
        actor.id
      }" ${dataTokenUuid} data-effect='${JSON.stringify(
        effect
      )}' data-might-target-user="${item.mightTargetUser}">
  ${game.pokerole.PokeroleItem.formatEffect(effect)}
</button>`;
    }

    // Chance dice rolls
    for (let group of item.getEffectGroupsWithChanceDice()) {
      html += `<button class="chat-action" data-action="chanceDiceRollEffect" data-actor-id="${
        actor.id
      }" ${dataTokenUuid} data-effect-group='${JSON.stringify(
        group
      )}' data-might-target-user="${item.mightTargetUser}">
  ${game.pokerole.PokeroleItem.formatChanceDiceGroup(group)}
</button>`;
    }

    doc.querySelector(".action-buttons").innerHTML = actionButtonsHtml;
  }
}
