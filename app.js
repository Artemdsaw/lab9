class Character {
  #hp;

  constructor(name, maxHp, power) {
    this.name = name;
    this.maxHp = maxHp;
    this.power = power;
    this.#hp = maxHp;
  }

  get health() {
    return this.#hp;
  }

  takeDamage(amount) {
    this.#hp = Math.max(0, this.#hp - amount);
  }

  heal(amount) {
    this.#hp = Math.min(this.maxHp, this.#hp + amount);
  }

  useSpecial() {
    return `${this.name} uses basic ability`;
  }
}



class Warrior extends Character {
  constructor(name, maxHp, power, stamina) {
    super(name, maxHp, power);
    this.stamina = stamina;
  }

  useSpecial() {
    if (this.stamina >= 10) {
      this.stamina -= 10;
      this.takeDamage(-15); // невеликий бонус (щоб було “відчутно”)
      return `${this.name} uses Battle Cry! (-10 stamina, +15 HP boost)`;
    }
    return `${this.name} has not enough stamina`;
  }
}



class Mage extends Character {
  constructor(name, maxHp, power, mana) {
    super(name, maxHp, power);
    this.mana = mana;
  }

  useSpecial() {
    if (this.mana >= 15) {
      this.mana -= 15;
      this.takeDamage(-20); // “heal spell”
      return `${this.name} casts Heal Spell! (-15 mana, +20 HP)`;
    }
    return `${this.name} has not enough mana`;
  }
}



class Archer extends Character {
  constructor(name, maxHp, power, arrows) {
    super(name, maxHp, power);
    this.arrows = arrows;
  }

  useSpecial() {
    if (this.arrows > 0) {
      this.arrows -= 1;
      return `${this.name} shoots a critical arrow! (-1 arrow, heavy damage)`;
    }
    return `${this.name} has no arrows`;
  }
}



class CharacterFactory {
  static create(data) {
    switch (data.type) {
      case "warrior":
        return new Warrior(data.name, data.maxHp, data.power, data.special);
      case "mage":
        return new Mage(data.name, data.maxHp, data.power, data.special);
      case "archer":
        return new Archer(data.name, data.maxHp, data.power, data.special);
      default:
        throw new Error("Unknown character type");
    }
  }
}



const StatsLogger = {
  printStats() {
    console.log(`[System] ${this.name} HP: ${this.health}`);
  }
};

Object.assign(Character.prototype, StatsLogger);



class SquadManager {
  #members = [];

  async loadHeroes(url) {
    try {
      const res = await fetch(url);

      if (!res.ok) throw new Error("File not found");

      const data = await res.json();

      this.#members = data.map(hero =>
        CharacterFactory.create(hero)
      );

      this.renderAll();

    } catch (error) {
      console.error("Error loading heroes:", error);
      document.getElementById("heroes").innerHTML =
        "<p style='color:red'>Failed to load heroes</p>";
    }
  }

  renderAll() {
    const container = document.getElementById("heroes");
    container.innerHTML = "";

    this.#members.forEach(hero => {
      const card = document.createElement("div");
      card.className = "card";

      let resource = "";
      if (hero.mana !== undefined) resource = `Mana: ${hero.mana}`;
      if (hero.stamina !== undefined) resource = `Stamina: ${hero.stamina}`;
      if (hero.arrows !== undefined) resource = `Arrows: ${hero.arrows}`;

      let icon = "⚔️";
      if (hero instanceof Warrior) icon = "🛡️";
      if (hero instanceof Mage) icon = "🪄";
      if (hero instanceof Archer) icon = "🏹";

      card.innerHTML = `
        <h3>${icon} ${hero.name}</h3>
        <p>Type: ${hero.constructor.name}</p>
        <p>HP: ${hero.health}</p>
        <p>${resource}</p>

        <button class="attack">Attack</button>
        <button class="heal">Heal</button>
        <button class="special">Special</button>

        <p class="log"></p>
      `;

      const log = card.querySelector(".log");

      card.querySelector(".attack").onclick = () => {
        hero.takeDamage(10);
        hero.printStats();
        this.renderAll();
      };

      card.querySelector(".heal").onclick = () => {
        hero.heal(10);
        hero.printStats();
        this.renderAll();
      };

      card.querySelector(".special").onclick = () => {
        const result = hero.useSpecial();
        hero.printStats();

        log.textContent = result;

        
        card.style.transform = "scale(1.03)";
        setTimeout(() => card.style.transform = "scale(1)", 150);
      };

      container.appendChild(card);
    });
  }
}



const manager = new SquadManager();
manager.loadHeroes("heroes.json");