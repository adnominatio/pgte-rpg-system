// Define the custom sheet class
class PGTEActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["pgte-rpg-system", "sheet", "actor"],
      template: "systems/pgte-rpg-system/templates/actor-sheet.html",
      width: 700,
      height: 800,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "stats"}]
    });
  }

  // Prepare data for the sheet
  getData() {
    const context = super.getData();
    
	context.system = context.actor.system || {};

  // Initialize stats if they don't exist
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
    // Add labels if stats exist but labels don't
    context.system.stats.sorcery.label = "SORCERY";
    context.system.stats.sorcery.uses = "magical ability, arcane knowledge";
    context.system.stats.lies.label = "LIES";
    context.system.stats.lies.uses = "stealth, flattery, charisma, deception";
    context.system.stats.violence.label = "VIOLENCE";
    context.system.stats.violence.uses = "combat, hitting, physical threats";
    context.system.stats.body.label = "BODY";
    context.system.stats.body.uses = "endurance, agility, strength";
    context.system.stats.mind.label = "MIND";
    context.system.stats.mind.uses = "knowledge, quick-thinking, investigation";
    context.system.stats.heart.label = "HEART";
    context.system.stats.heart.uses = "insight, foresight, people skills";
  }
  

  // Handle sheet events
  activateListeners(html) {
    super.activateListeners(html);
    
    // Move all your existing roll button code here
    html.find('.roll-stat').click(this._onRollStat.bind(this));
    html.find('.roll-aspect').click(this._onRollAspect.bind(this));
    html.find('.roll-story-die').click(this._onRollStoryDie.bind(this));
    html.find('.roll-extra').click(this._onRollExtra.bind(this));
    html.find('.roll-story').click(this._onRollStory.bind(this));
  }

  // Roll methods
  async _onRollStat(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const stat = element.dataset.stat;
    const die = element.dataset.die;
    const roll = await new Roll(`1${die}`).roll({async: true});
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      flavor: `Rolling ${stat}: ${die}`
    });
  }

  async _onRollAspect(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const die = element.dataset.die;
    const type = element.dataset.type;
    const name = element.dataset.name || "Aspect";
    const roll = await new Roll(`1${die}`).roll({async: true});
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      flavor: `<b>${name}</b> (${type})`
    });
  }

  async _onRollStoryDie(event) {
    event.preventDefault();
    const die = this.actor.system.resources.storyDie.value || "d4";
    const roll = await new Roll(`1${die}`).roll({async: true});
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      flavor: `Rolling Story Die: ${die}`
    });
  }

  async _onRollExtra(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const die = element.dataset.die;
    const roll = await new Roll(`1${die}`).roll({async: true});
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      flavor: `Extra ${die} Roll`
    });
  }

  async _onRollStory(event) {
    event.preventDefault();
    const die = this.actor.system.resources.storyDie.value || "d4";
    const roll = await new Roll(`1${die}`).roll({async: true});
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      flavor: `Pattern of Three: Story Die`
    });
  }
}

// Register the sheet
Hooks.once("init", function() {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("pgte-rpg-system", PGTEActorSheet, {
    types: ["character", "npc"],
    makeDefault: true,
    label: "PGTE Character Sheet"
  });
});

// Remove the old Hooks.on("ready") block since we're handling events in the sheet class now