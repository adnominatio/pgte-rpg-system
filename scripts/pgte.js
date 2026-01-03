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

Handlebars.registerHelper("eq", function(a, b) {
  return a === b;
});

Hooks.once("init", function() {
  // Ensure core Foundry fonts and icons are available
  console.log("PGTE System: Initializing with icon font support");
  
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("pgte-rpg-system", PGTEActorSheet, {
    types: ["character", "npc"],
    makeDefault: true,
    label: "PGTE Character Sheet"
  });
});

Hooks.once("ready", function() {
  console.log("PGTE System: Ready - checking for icon fonts");
  // Verify FontAwesome is loaded
  if (!document.querySelector('link[href*="fontawesome"]')) {
    console.warn("PGTE System: FontAwesome may not be loaded properly");
  }
});

class PGTEActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["pgte-rpg-system", "sheet", "actor"],
      template: "systems/pgte-rpg-system/templates/actor-sheet.html",
      width: 800,
      height: 900,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }]
    });
  }

  async getData() {
    const context = await super.getData();
    context.system = context.actor.system || {};

    // Initialize stats with proper structure
    if (!context.system.stats) {
      context.system.stats = {
        sorcery: { value: "d4", label: "SORCERY", uses: "magical ability, arcane knowledge, bindings, rituals" },
        lies: { value: "d4", label: "LIES", uses: "stealth, flattery, charisma, deception" },
        violence: { value: "d4", label: "VIOLENCE", uses: "combat, weapons, physical threats" },
        body: { value: "d4", label: "BODY", uses: "endurance, agility, strength" },
        mind: { value: "d4", label: "MIND", uses: "knowledge, investigation, quick-thinking" },
        heart: { value: "d4", label: "HEART", uses: "insight, foresight, people skills, Story-awareness and Namelore" }
      };
    } else {
      const stats = context.system.stats;
      stats.sorcery.label = "SORCERY"; stats.sorcery.uses = "magical ability, arcane knowledge, bindings, rituals";
      stats.lies.label = "LIES"; stats.lies.uses = "stealth, flattery, charisma, deception";
      stats.violence.label = "VIOLENCE"; stats.violence.uses = "combat, weapons, physical threats";
      stats.body.label = "BODY"; stats.body.uses = "endurance, agility, strength";
      stats.mind.label = "MIND"; stats.mind.uses = "knowledge, investigation, quick-thinking";
      stats.heart.label = "HEART"; stats.heart.uses = "insight, foresight, people skills, Story-awareness and Namelore";
    }

    // Initialize resources
    if (!context.system.resources) {
      context.system.resources = {
        storyDie: { value: "d4" },
        hits: {
          physical: { value: 3, max: 3 },
          mental: { value: 0, max: 0 }
        },
        storyTokens: { value: 0 }
      };
    } else if (!context.system.resources.hits.physical) {
      // Migrate old flat hits structure to new separated structure
      context.system.resources.hits = {
        physical: {
          value: context.system.resources.hits.value || 0,
          max: context.system.resources.hits.max || 3
        },
        mental: { value: 0, max: 0 }
      };
    }

    // Initialize aspects
    if (!context.system.aspects) {
      context.system.aspects = {
        aspect1: { name: "", nature: "", passive: "", active: "", firstUse: true },
        aspect2: { name: "", nature: "", passive: "", active: "", firstUse: true },
        aspect3: { name: "", nature: "", passive: "", active: "", firstUse: true }
      };
    }

    // Initialize bonus dice
    if (!context.system.bonusDice) {
      context.system.bonusDice = {
        item1: { name: "", die: "" },
        item2: { name: "", die: "" },
        item3: { name: "", die: "" }
      };
    }

    // Initialize equipment
    if (!context.system.equipment) {
      context.system.equipment = {
        item1: { name: "", quantity: 0 },
        item2: { name: "", quantity: 0 },
        item3: { name: "", quantity: 0 }
      };
    }

    // Initialize notes
    if (!context.system.notes) {
      context.system.notes = {
        patternOfThree: ""
      };
    }

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Rolls
    html.find('.roll-stat').click(this._onRollStat.bind(this));
    html.find('.roll-stat-name').click(this._onRollStatName.bind(this));
    html.find('.roll-aspect').click(this._onRollAspect.bind(this));
    html.find('.roll-story-die').click(this._onRollStoryDie.bind(this));
    html.find('.roll-extra').click(this._onRollExtra.bind(this));
    html.find('.roll-item').click(this._onRollItem.bind(this));

    // Hits toggles (physical and mental)
    html.find('.resource-group:nth-child(1) .hits-up').click(ev => {
      ev.preventDefault();
      const current = this.actor.system.resources.hits.physical.value || 0;
      const max = this.actor.system.resources.hits.physical.max || 6;
      if (current < max) {
        this.actor.update({ "system.resources.hits.physical.value": current + 1 });
      }
    });

    html.find('.resource-group:nth-child(1) .hits-down').click(ev => {
      ev.preventDefault();
      const current = this.actor.system.resources.hits.physical.value || 0;
      if (current > 0) {
        this.actor.update({ "system.resources.hits.physical.value": current - 1 });
      }
    });

    html.find('.resource-group:nth-child(2) .hits-up').click(ev => {
      ev.preventDefault();
      const current = this.actor.system.resources.hits.mental.value || 0;
      const max = this.actor.system.resources.hits.mental.max || 6;
      if (current < max) {
        this.actor.update({ "system.resources.hits.mental.value": current + 1 });
      }
    });

    html.find('.resource-group:nth-child(2) .hits-down').click(ev => {
      ev.preventDefault();
      const current = this.actor.system.resources.hits.mental.value || 0;
      if (current > 0) {
        this.actor.update({ "system.resources.hits.mental.value": current - 1 });
      }
    });

    // Story tokens toggles
    html.find('.tokens-up').click(ev => {
      ev.preventDefault();
      const current = this.actor.system.resources.storyTokens.value || 0;
      this.actor.update({ "system.resources.storyTokens.value": current + 1 });
    });

    html.find('.tokens-down').click(ev => {
      ev.preventDefault();
      const current = this.actor.system.resources.storyTokens.value || 0;
      if (current > 0) {
        this.actor.update({ "system.resources.storyTokens.value": current - 1 });
      }
    });

    // Item quantity toggles
    html.find('.item-qty-up').click(ev => {
      ev.preventDefault();
      const item = ev.currentTarget.dataset.item;
      const current = this.actor.system.equipment[item].quantity || 0;
      this.actor.update({ [`system.equipment.${item}.quantity`]: current + 1 });
    });

    html.find('.item-qty-down').click(ev => {
      ev.preventDefault();
      const item = ev.currentTarget.dataset.item;
      const current = this.actor.system.equipment[item].quantity || 0;
      if (current > 0) {
        this.actor.update({ [`system.equipment.${item}.quantity`]: current - 1 });
      }
    });

    // Hit markers (for visual clicking)
    html.find('.hit-marker').click(ev => {
      ev.preventDefault();
      const current = this.actor.system.resources.hits.value || 0;
      const index = Array.from(ev.currentTarget.parentNode.children).indexOf(ev.currentTarget);
      let newValue = index + 1;
      if (newValue === current) newValue--; // allow decrement
      this.actor.update({ "system.resources.hits.value": newValue });
    });
  }

  async _onRollStat(event) {
    event.preventDefault();
    const { stat, die } = event.currentTarget.dataset;
    const roll = await new Roll(`1${die}`).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Rolling ${stat}: ${die}`
    });
  }

  async _onRollStatName(event) {
    event.preventDefault();
    const { stat, die } = event.currentTarget.dataset;
    const roll = await new Roll(`1${die}`).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Rolling ${stat}: ${die}`
    });
  }

  async _onRollAspect(event) {
    event.preventDefault();
    const { die, type, name = "Aspect" } = event.currentTarget.dataset;
    const roll = await new Roll(`1${die}`).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<b>${name}</b> (${type})`
    });
  }

  async _onRollStoryDie(event) {
    event.preventDefault();
    const die = this.actor.system.resources.storyDie.value || "d4";
    const roll = await new Roll(`1${die}`).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Rolling Story Die: ${die}`
    });
  }

  async _onRollExtra(event) {
    event.preventDefault();
    const die = event.currentTarget.dataset.die;
    const roll = await new Roll(`1${die}`).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Rule of Cool: ${die}`
    });
  }

  async _onRollItem(event) {
    event.preventDefault();
    const { die, name = "Item" } = event.currentTarget.dataset;
    if (!die) {
      ui.notifications.warn("No die selected for this item!");
      return;
    }
    const roll = await new Roll(`1${die}`).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${name}: ${die}`
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