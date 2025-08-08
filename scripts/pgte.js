Handlebars.registerHelper("times", function(n, block) {
  let accum = "";
  for (let i = 0; i < n; ++i) {
    accum += block.fn(i);
  }
  return accum;
});

Handlebars.registerHelper("subtract", function(a, b) {
  return a - b;
});

class PGTEActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["pgte-rpg-system", "sheet", "actor"],
      template: "systems/pgte-rpg-system/templates/actor-sheet.html",
      width: 700,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "stats" }]
    });
  }

  async getData() {
    const context = await super.getData();
    context.system = context.actor.system || {};

    if (!context.system.stats) {
      context.system.stats = {
        sorcery: { value: "d4", label: "SORCERY", uses: "magical ability, arcane knowledge" },
        lies: { value: "d4", label: "LIES", uses: "stealth, flattery, charisma, deception" },
        violence: { value: "d4", label: "VIOLENCE", uses: "combat, hitting, physical threats" },
        body: { value: "d4", label: "BODY", uses: "endurance, agility, strength" },
        mind: { value: "d4", label: "MIND", uses: "knowledge, quick-thinking, investigation" },
        heart: { value: "d4", label: "HEART", uses: "insight, foresight, people skills" }
      };
    } else {
      const stats = context.system.stats;
      stats.sorcery.label = "SORCERY"; stats.sorcery.uses = "magical ability, arcane knowledge";
      stats.lies.label = "LIES"; stats.lies.uses = "stealth, flattery, charisma, deception";
      stats.violence.label = "VIOLENCE"; stats.violence.uses = "combat, hitting, physical threats";
      stats.body.label = "BODY"; stats.body.uses = "endurance, agility, strength";
      stats.mind.label = "MIND"; stats.mind.uses = "knowledge, quick-thinking, investigation";
      stats.heart.label = "HEART"; stats.heart.uses = "insight, foresight, people skills";
    }

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Rolls
    html.find('.roll-stat').click(this._onRollStat.bind(this));
    html.find('.roll-aspect').click(this._onRollAspect.bind(this));
    html.find('.roll-story-die').click(this._onRollStoryDie.bind(this));
    html.find('.roll-extra').click(this._onRollExtra.bind(this));
    html.find('.roll-story').click(this._onRollStory.bind(this));

    // Toggle Hits
    html.find('.hit-marker').click(ev => {
      ev.preventDefault();
      const current = this.actor.system.resources.hits.value || 0;
      const index = Number(ev.currentTarget.dataset.index);
      let newValue = index + 1;
      if (newValue === current) newValue--; // allow decrement
      this.actor.update({ "system.resources.hits.value": newValue });
    });

    // Toggle Story Tokens
    html.find('.token-marker').click(ev => {
      ev.preventDefault();
      const current = this.actor.system.resources.storyTokens.value || 0;
      const index = Number(ev.currentTarget.dataset.index);
      let newValue = index + 1;
      if (newValue === current) newValue--;
      this.actor.update({ "system.resources.storyTokens.value": newValue });
    });
  }

  async _onRollStat(event) {
    event.preventDefault();
    const { stat, die } = event.currentTarget.dataset;
    const roll = await new Roll(`1${die}`).roll({ async: true });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Rolling ${stat}: ${die}`
    });
  }

  async _onRollAspect(event) {
    event.preventDefault();
    const { die, type, name = "Aspect" } = event.currentTarget.dataset;
    const roll = await new Roll(`1${die}`).roll({ async: true });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<b>${name}</b> (${type})`
    });
  }

  async _onRollStoryDie(event) {
    event.preventDefault();
    const die = this.actor.system.resources.storyDie.value || "d4";
    const roll = await new Roll(`1${die}`).roll({ async: true });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Rolling Story Die: ${die}`
    });
  }

  async _onRollExtra(event) {
    event.preventDefault();
    const die = event.currentTarget.dataset.die;
    const roll = await new Roll(`1${die}`).roll({ async: true });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Extra ${die} Roll`
    });
  }

  async _onRollStory(event) {
    event.preventDefault();
    const die = this.actor.system.resources.storyDie.value || "d4";
    const roll = await new Roll(`1${die}`).roll({ async: true });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Pattern of Three: Story Die`
    });
  }
}

Hooks.once("init", function() {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("pgte-rpg-system", PGTEActorSheet, {
    types: ["character", "npc"],
    makeDefault: true,
    label: "PGTE Character Sheet"
  });
});
