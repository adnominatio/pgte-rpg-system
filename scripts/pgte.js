Hooks.on("ready", () => {
  // Aspect rolls
  document.querySelectorAll(".roll-aspect").forEach(btn => {
    btn.addEventListener("click", async evt => {
      const die = evt.currentTarget.dataset.die;
      const type = evt.currentTarget.dataset.type;
      const name = evt.currentTarget.dataset.name || "Aspect";
      const roll = await new Roll(`1${die}`).roll({async: true});
      roll.toMessage({
        flavor: `<b>${name}</b> (${type})`
      });
    });
  });

  // Extra +D4 roll (Rule of Cool)
  document.querySelectorAll(".roll-extra").forEach(btn => {
    btn.addEventListener("click", async evt => {
      const die = evt.currentTarget.dataset.die;
      const roll = await new Roll(`1${die}`).roll({async: true});
      roll.toMessage({flavor: `Extra ${die} Roll`});
    });
  });

  // Pattern of Three: Roll Story Die again
  document.querySelectorAll(".roll-story").forEach(btn => {
    btn.addEventListener("click", async evt => {
      const storyDieEl = document.querySelector("select[name='system.resources.storyDie.value']");
      const die = storyDieEl?.value || "d4";
      const roll = await new Roll(`1${die}`).roll({async: true});
      roll.toMessage({flavor: `Pattern of Three: Story Die`});
    });
  });

  // Stat rolls
  document.querySelectorAll(".roll-stat").forEach(btn => {
    btn.addEventListener("click", async evt => {
      const stat = evt.currentTarget.dataset.stat;
      const die = evt.currentTarget.dataset.die;
      const roll = await new Roll(`1${die}`).roll({async: true});
      roll.toMessage({flavor: `Rolling ${stat}: ${die}`});
    });
  });

  // Story Die main roll
  document.querySelectorAll(".roll-story-die").forEach(btn => {
    btn.addEventListener("click", async evt => {
      const die = evt.currentTarget.dataset.die;
      const roll = await new Roll(`1${die}`).roll({async: true});
      roll.toMessage({flavor: `Rolling Story Die: ${die}`});
    });
  });
});
