Hooks.on("ready", () => {
  document.querySelectorAll(".roll-stat").forEach(btn => {
    btn.addEventListener("click", async evt => {
      const stat = evt.currentTarget.dataset.stat;
      const die = evt.currentTarget.dataset.die;
      const roll = await new Roll(`1${die}`).roll({async: true});
      roll.toMessage({flavor: `Rolling ${stat}: ${die}`});
    });
  });

  document.querySelectorAll(".roll-story-die").forEach(btn => {
    btn.addEventListener("click", async evt => {
      const die = evt.currentTarget.dataset.die;
      const roll = await new Roll(`1${die}`).roll({async: true});
      roll.toMessage({flavor: `Rolling Story Die: ${die}`});
    });
  });
});