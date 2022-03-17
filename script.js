let money = new BigNumber(0);
let perClick = new BigNumber(1);
let perSecond = new BigNumber(0);
let perSecondOverflow = new BigNumber(0);
let buyCounts = [1, 5, 10, 25, 100];
let buyCount = 0;
let elements = {};
let upgrades = [];

function suffix(num) {
  let suf = ["", "K", "M", "B", "T", "Q", "Qu", "S", "Sp", "O", "N", "D", "UD", "DD", "TD", "QD", "QuD", "SD", "SpD", "OD", "ND", "V", "UV", "DV", "TV", "QV", "QuV", "SV", "SpV", "OV", "NV", "Tr", "UTr", "DTr", "TTr", "QTr", "QuTr", "STr", "SpTr", "OTr", "NTr", "Qa"];
  let power = 0;
  let cur = num;
  if (cur.lt(1000)) {
    return "" + cur;
  }
  while (cur.gte(1000)) {
    cur = cur.div(1000);
    power += 3;
  }
  if (power > (suf.length - 1) * 3) {
    cur = cur.times(1000);
    power -= 3;
    while (cur.gte(10)) {
      cur = cur.div(10);
      power += 1;
    }
    return cur.toFixed(3) + "e" + power;
  } else {
    return cur.toFixed(3) + suf[power / 3];
  }
}

function setup() {
  noCanvas();
  elements.upgradesDiv = select("#upgradesDiv");
  elements.mainDiv = select("#mainDiv");
  elements.moneyElement = select("#mainDiv_balance");
  elements.moneyButton = select("#mainDiv_moneyButton");
  elements.perClick = select("#mainDiv_perClick");
  elements.perSecond = select("#mainDiv_perSecond");
  elements.upgradeCount = select("#mainDiv_upgradeCount");
  elements.moneyButton.mousePressed(() => {
    money = money.plus(perClick);
    recalcBuyButtons();
  });
  elements.upgradeCount.mousePressed(() => {
    buyCount = (buyCount + 1) % buyCounts.length;
    elements.upgradeCount.html("Buy x" + buyCounts[buyCount]);
  });
  // upgrade(name, type [0 = mpc, 1 = mps], bonus per upgrade, base cost, cost multiplier)
  /*
  bonus types:
  self-mult: gives upgrade a personal multiplier
  click-mult: gives a global per-click multiplier
  second-mult: gives a global per-second multiplier
  */
  let jsonUpgrades = JSON.parse(select('template').elt.innerHTML);
  for (let i = 0; i < jsonUpgrades.upgrades.length; i++) {
    let currentUpgrade = jsonUpgrades.upgrades[i];
    upgrades.push(upgrade(currentUpgrade.name, currentUpgrade.bonusType == "click" ? 0 : 1, new BigNumber(currentUpgrade.bonus), new BigNumber(currentUpgrade.cost), currentUpgrade.costMult, currentUpgrade.upgrades));
  }
  /*
  upgrades = [
    upgrade("Basic Auto Clicker", 1, new BigNumber(0.1), new BigNumber(5), 1.005, [
      {
        "name": "Test1",
        "level": 0,
        "levels": [
          {
            "desc": "test desc 1",
            "cost": new BigNumber(5),
            "bonuses": {}
          },
          {
            "desc": "test desc 2",
            "cost": new BigNumber(20),
            "bonuses": {
              "self-mult": new BigNumber(1.5),
              "second-mult": new BigNumber(1000000000)
            }
          },
          {
            "desc": "test desc 3",
            "cost": new BigNumber(0),
            "bonuses": {
              "self-mult": new BigNumber(20)
            }
          }
        ]
      }
    ]),
    upgrade("Basic Money Booster", 0, new BigNumber(0.1), new BigNumber(30), 1.005),
    upgrade("Good Auto Clicker", 1, new BigNumber(0.2), new BigNumber(12), 1.01),
    upgrade("Good Money Booster", 0, new BigNumber(0.2), new BigNumber(70), 1.01),
    upgrade("Great Auto Clicker", 1, new BigNumber(0.5), new BigNumber(30), 1.02),
    upgrade("Great Money Booster", 0, new BigNumber(0.5), new BigNumber(175), 1.02),
    upgrade("Poor Worker", 1, new BigNumber(1), new BigNumber(65), 1.03),
    upgrade("Multi-Finger Clicking", 0, new BigNumber(1), new BigNumber(400), 1.03),
    upgrade("Good Worker", 1, new BigNumber(2), new BigNumber(125), 1.04),
    upgrade("Jitter-Clicking", 0, new BigNumber(2), new BigNumber(750), 1.04),
    upgrade("Excellent Worker", 1, new BigNumber(4), new BigNumber(250), 1.05),
    upgrade("Multi-Finger Jitter Clicking", 0, new BigNumber(4), new BigNumber(1550), 1.05),
    upgrade("Family of Workers", 1, new BigNumber(10), new BigNumber(650), 1.06),
    upgrade("Macros", 0, new BigNumber(10), new BigNumber(4000), 1.06),
    upgrade("Extended Family of Workers", 1, new BigNumber(30), new BigNumber(2000), 1.07),
    upgrade("Multiple Macros", 0, new BigNumber(30), new BigNumber(12000), 1.07),
    upgrade("Godlike Worker", 1, new BigNumber(100), new BigNumber(6500), 1.08),
    upgrade("Macro That Activates Macros", 0, new BigNumber(100), new BigNumber(40000), 1.08),
    upgrade("Overclocking", 1, new BigNumber(1000), new BigNumber(70000), 1.09),
    upgrade("Hacking", 0, new BigNumber(1000), new BigNumber(450000), 1.09),
    upgrade("Factory", 1, new BigNumber(10000), new BigNumber(750000), 1.1),
    upgrade("Super Hacking", 0, new BigNumber(10000), new BigNumber(5000000), 1.1),
    upgrade("Many Factories", 1, new BigNumber(100000), new BigNumber(8000000), 1.12),
    upgrade("Ultra Hacking", 0, new BigNumber(100000), new BigNumber(55000000), 1.12),
    upgrade("Company", 1, new BigNumber("1e+6"), new BigNumber("8.5e+7"), 1.14),
    upgrade("Government Assistance", 0, new BigNumber("1e+6"), new BigNumber("6e+8"), 1.14),
    upgrade("Super Company", 1, new BigNumber("1e+7"), new BigNumber("9e+8"), 1.16),
    upgrade("International Assistance", 0, new BigNumber("1e+7"), new BigNumber("6.5e+9"), 1.16),
    upgrade("Global Company", 1, new BigNumber("1e+8"), new BigNumber("9.5e+9"), 1.18),
    upgrade("Alien Assistance", 0, new BigNumber("1e+8"), new BigNumber("7e+10"), 1.18)
  ]
  */
}

function draw() {
  perSecondOverflow = perSecondOverflow.plus(perSecond.div(60));
  money = money.plus(perSecondOverflow.integerValue(BigNumber.ROUND_FLOOR));
  if (perSecondOverflow.gte(1)) {
    recalcBuyButtons();
  }
  perSecondOverflow = perSecondOverflow.minus(perSecondOverflow.integerValue(BigNumber.ROUND_FLOOR));
  elements.moneyElement.html("$" + suffix(money));
  elements.upgradesDiv.size(elements.mainDiv.size().width - 12, windowHeight - elements.mainDiv.size().height - 80);
}

function getGlobalMultipliers() {
  let perClickMult = new BigNumber(1);
  let perSecondMult = new BigNumber(1);

  for (let i = 0; i < upgrades.length; i++) {
    let upgradeData = upgrades[i].upgradesData;
    if (upgradeData != undefined) {
      for (let j = 0; j < upgradeData.data.length; j++) {
        let currentUpgrade = upgradeData.data[j];
        let bonuses = currentUpgrade.levels[currentUpgrade.level].bonuses;
        if (bonuses["click-mult"] != undefined) {
          perClickMult = perClickMult.times(bonuses["click-mult"]);
        }
        if (bonuses["second-mult"] != undefined) {
          perSecondMult = perSecondMult.times(bonuses["second-mult"]);
        }
      }
    }
  }
  return { second: perSecondMult, click: perClickMult };
}

function getLocalMultiplier(upgradeData) {
  let selfMult = new BigNumber(1);
  if (upgradeData != undefined) {
    for (let j = 0; j < upgradeData.data.length; j++) {
      let currentUpgrade = upgradeData.data[j];
      let bonuses = currentUpgrade.levels[currentUpgrade.level].bonuses;
      if (bonuses["self-mult"] != undefined) {
        selfMult = selfMult.times(bonuses["self-mult"]);
      }
    }
  }
  return selfMult;
}

function getLocalCost(upgradeData) {
  let cost = new BigNumber(1);

  for (let i = 0; i < upgrades.length; i++) {
    let upgradeData = upgrades[i].upgradesData;
    if (upgradeData != undefined) {
      for (let j = 0; j < upgradeData.data.length; j++) {
        let currentUpgrade = upgradeData.data[j];
        let bonuses = currentUpgrade.levels[currentUpgrade.level].bonuses;
        if (bonuses["global-cost"] != undefined) {
          cost = cost.times(bonuses["global-cost"]);
        }
      }
    }
  }

  if (upgradeData != undefined) {
    for (let j = 0; j < upgradeData.data.length; j++) {
      let currentUpgrade = upgradeData.data[j];
      let bonuses = currentUpgrade.levels[currentUpgrade.level].bonuses;
      if (bonuses["self-cost"] != undefined) {
        cost = cost.times(bonuses["self-cost"]);
      }
    }
  }
  return cost;
}

function recalcCounts() {
  let globalMult = getGlobalMultipliers();

  let perClickMult = globalMult.click;
  let perSecondMult = globalMult.second;

  perClick = new BigNumber(perClickMult);
  perSecond = new BigNumber(0);

  for (let i = 0; i < upgrades.length; i++) {
    let upgradeData = upgrades[i].upgradesData;
    let selfMult = new BigNumber(1);
    if (upgradeData != undefined) {
      for (let j = 0; j < upgradeData.data.length; j++) {
        let currentUpgrade = upgradeData.data[j];
        let bonuses = currentUpgrade.levels[currentUpgrade.level].bonuses;
        if (bonuses["self-mult"] != undefined) {
          selfMult = selfMult.times(bonuses["self-mult"]);
        }
      }
    }
    if (upgrades[i].data.type == 0) {
      perClick = perClick.plus(upgrades[i].data.upgradeAmount.times(perClickMult).times(selfMult));
    } else {
      perSecond = perSecond.plus(upgrades[i].data.upgradeAmount.times(perSecondMult).times(selfMult));
    }
  }

  elements.perClick.html("$" + suffix(perClick) + " per click");
  elements.perSecond.html("$" + suffix(perSecond) + " per second");
}

function recalcText() {
  for (let i = 0; i < upgrades.length; i++) {
    upgrades[i].setText();
  }
}

function recalcBuyButtons() {
  for (let i = 0; i < upgrades.length; i++) {
    let localCost = getLocalCost(upgrades[i].upgradesData);

    upgrades[i].upgradeButton.removeClass("green-button");
    upgrades[i].upgradeButton.removeClass("red-button");
    if (money.gte(upgrades[i].data.cost.times(localCost).integerValue(BigNumber.ROUND_CEIL))) {
      upgrades[i].upgradeButton.addClass("green-button");
    } else {
      upgrades[i].upgradeButton.addClass("red-button");
    }

    let upgradeData = upgrades[i].upgradesData;
    if (upgradeData != undefined) {
      if (upgradeData.selectedUpgrade > -1) {
        let currentUpgrade = upgradeData.data[upgradeData.selectedUpgrade];
        if (money.gte(currentUpgrade.levels[currentUpgrade.level].cost)) {
          upgradeData.upgradeUpgradeButton.addClass("green-button");
          upgradeData.upgradeUpgradeButton.removeClass("red-button");
          upgradeData.upgradeUpgradeButton.removeClass("gray-button");
          upgradeData.upgradeUpgradeButton.html("Upgrade!");
        } else {
          upgradeData.upgradeUpgradeButton.removeClass("green-button");
          upgradeData.upgradeUpgradeButton.addClass("red-button");
          upgradeData.upgradeUpgradeButton.removeClass("gray-button");
          upgradeData.upgradeUpgradeButton.html("Upgrade!");
        }
        if (currentUpgrade.levels.length - 1 == currentUpgrade.level) {
          upgradeData.upgradeUpgradeButton.removeClass("green-button");
          upgradeData.upgradeUpgradeButton.removeClass("red-button");
          upgradeData.upgradeUpgradeButton.addClass("gray-button");
          upgradeData.upgradeUpgradeButton.html("Maxed Out");
        }
      }
    }
  }
}

function upgrade(name, type, bonus, cost, costMult, upgrades) {
  let div = createDiv("");
  div.parent(mainDiv);
  div.parent(elements.upgradesDiv);
  div.class("white-div");
  div.style("overflow", "auto");
  div.style("height", "auto");
  let title;
  if (type == 0) {
    title = createElement("h1", name + " [lvl 0]");
  } else {
    title = createElement("h1", name + " [lvl 0]");
  }
  title.parent(div);
  let bonusText;
  let currentBonusText;
  if (type == 0) {
    bonusText = createP("+$" + suffix(bonus) + " per click (each)");
    currentBonusText = createP("Current: +$0 per click");
  } else {
    bonusText = createP("+$" + suffix(bonus) + " per second (each)");
    currentBonusText = createP("Current: +$0 per second");
  }
  bonusText.parent(div);
  currentBonusText.parent(div);
  let costText = createP("Cost: $" + suffix(cost));
  costText.parent(div);
  let upgradeButton = createButton("Upgrade!");
  upgradeButton.class("red-button");
  upgradeButton.parent(div);
  let upgradesData = null;
  let data = {
    data: {
      name: name,
      type: type,
      bonus: bonus,
      cost: cost,
      level: 0,
      costMult: costMult,
      upgradeAmount: new BigNumber(0) },

    div: div,
    title: title,
    bonusText: bonusText,
    currentBonusText: currentBonusText,
    costText: costText,
    upgradeButton: upgradeButton };


  if (upgrades != undefined) {
    for (let i = 0; i < upgrades.length; i++) {
      for (let j = 0; j < upgrades[i].levels.length; j++) {
        upgrades[i].levels[j].cost = new BigNumber(upgrades[i].levels[j].cost);
        for (let k in upgrades[i].levels[j].bonuses) {
          if (upgrades[i].levels[j].bonuses.hasOwnProperty(k)) {
            upgrades[i].levels[j].bonuses[k] = new BigNumber(upgrades[i].levels[j].bonuses[k]);
          }
        }
      }
    }
    let upgradesDiv = createDiv("");
    createElement("h1", "Upgrades:").parent(upgradesDiv);
    upgradesDiv.style("positon", "relative");
    upgradesDiv.style("height", "auto");
    let selectorDiv = createDiv("");
    selectorDiv.class("connected-buttons");
    selectorDiv.parent(upgradesDiv);
    selectorDiv.style("padding", "0px");
    selectorDiv.style("margin", "0px");
    upgradesDiv.parent(div);
    upgradesDiv.size(div.size().width - 48);
    let descText = createP("");
    descText.parent(upgradesDiv);
    let upgradeUpgradeButton = createButton("Upgrade!");
    upgradeUpgradeButton.parent(upgradesDiv);
    upgradeUpgradeButton.addClass("gray-button");
    upgradesData = {
      selectorButtons: [],
      selectedUpgrade: -1,
      data: upgrades,
      descText: descText,
      upgradeUpgradeButton: upgradeUpgradeButton,
      setDescText: () => {
        if (upgradesData.selectedUpgrade > -1) {
          let setText = upgrades[upgradesData.selectedUpgrade].levels[upgrades[upgradesData.selectedUpgrade].level].desc;
          if (upgrades[upgradesData.selectedUpgrade].level < upgrades[upgradesData.selectedUpgrade].levels.length - 1) {
            setText += "<br><br>Cost: $";
            setText += suffix(upgrades[upgradesData.selectedUpgrade].levels[upgrades[upgradesData.selectedUpgrade].level].cost);
          }
          let bonuses = upgrades[upgradesData.selectedUpgrade].levels[upgrades[upgradesData.selectedUpgrade].level].bonuses;
          if (Object.keys(bonuses).length === 0 && bonuses.constructor === Object) {
            setText += "<br><br>No bonuses yet...";
          } else {
            setText += "<br><br>Bonuses:";
            if (bonuses["self-mult"] != undefined) {
              setText += "<br>Self Multiplier: x" + suffix(bonuses["self-mult"]);
            }
            if (bonuses["click-mult"] != undefined) {
              setText += "<br>Global Per-Click Multiplier: x" + suffix(bonuses["click-mult"]);
            }
            if (bonuses["second-mult"] != undefined) {
              setText += "<br>Global Per-Second Multiplier: x" + suffix(bonuses["second-mult"]);
            }
            if (bonuses["self-cost"] != undefined) {
              setText += "<br>Cost Reduction: " + ((1 - bonuses["self-cost"]) * 100).toFixed(2) + "%";
            }
            if (bonuses["global-cost"] != undefined) {
              setText += "<br>Global Cost Reduction: " + ((1 - bonuses["global-cost"]) * 100).toFixed(2) + "%";
            }
          }
          upgradesData.descText.html(setText);
        }
      } };

    upgradeUpgradeButton.mousePressed(() => {
      if (upgradesData.selectedUpgrade > -1) {
        if (upgrades[upgradesData.selectedUpgrade].level < upgrades[upgradesData.selectedUpgrade].levels.length - 1) {
          let cost = upgrades[upgradesData.selectedUpgrade].levels[upgrades[upgradesData.selectedUpgrade].level].cost;
          if (money.gte(cost)) {
            money = money.minus(cost);
            upgrades[upgradesData.selectedUpgrade].level += 1;
          }
          upgradesData.setDescText();
          if (upgrades[upgradesData.selectedUpgrade].level == upgrades[upgradesData.selectedUpgrade].levels.length - 1) {
            upgradeUpgradeButton.html("Maxed Out");
            upgradeUpgradeButton.removeClass("red-button");
            upgradeUpgradeButton.removeClass("green-button");
            upgradeUpgradeButton.removeClass("gray-button");
            upgradeUpgradeButton.addClass("gray-button");
          }

          recalcCounts();
          recalcBuyButtons();
          recalcText();
        }
      }
    });
    for (let i = 0; i < upgrades.length; i++) {
      let selectorButton = createButton(upgrades[i].name);
      selectorButton.class("yellow-button");
      selectorButton.parent(selectorDiv);
      selectorButton.mousePressed(() => {
        upgradesData.selectedUpgrade = i;
        for (let j = 0; j < upgradesData.selectorButtons.length; j++) {
          upgradesData.selectorButtons[j].removeClass("selected");
        }
        selectorButton.addClass("selected");
        upgradesData.upgradeUpgradeButton.removeClass("gray-button");
        upgradesData.setDescText();
        recalcBuyButtons();
      });
      upgradesData.selectorButtons.push(selectorButton);
    }
  }

  if (upgrades != undefined) {
    data.upgradesData = upgradesData;
  }

  data.setText = () => {
    let localCost = getLocalCost(data.upgradesData);
    data.costText.html("Cost: $" + suffix(data.data.cost.times(localCost).integerValue(BigNumber.ROUND_CEIL)));
    let globalMult = getGlobalMultipliers();
    if (data.data.type == 0) {
      data.title.html(data.data.name + " [lvl " + data.data.level + "]");
      data.currentBonusText.html("Current: +$" + suffix(data.data.upgradeAmount.times(globalMult.click).times(getLocalMultiplier(data.upgradesData))) + " per click");
      data.bonusText.html("+$" + suffix(data.data.bonus.times(globalMult.click).times(getLocalMultiplier(data.upgradesData))) + " per click (each)");
    } else {
      data.title.html(data.data.name + " [lvl " + data.data.level + "]");
      data.currentBonusText.html("Current: +$" + suffix(data.data.upgradeAmount.times(globalMult.second).times(getLocalMultiplier(data.upgradesData))) + " per second");
      data.bonusText.html("+$" + suffix(data.data.bonus.times(globalMult.second).times(getLocalMultiplier(data.upgradesData))) + " per second (each)");
    }
  };

  upgradeButton.mousePressed(() => {
    let localCost = getLocalCost(data.upgradesData);
    for (let i = 0; i < buyCounts[buyCount]; i++) {
      if (money.gte(data.data.cost.times(localCost).integerValue(BigNumber.ROUND_CEIL))) {
        money = money.minus(data.data.cost.times(localCost).integerValue(BigNumber.ROUND_CEIL));
        data.data.cost = data.data.cost.times(data.data.costMult).integerValue(BigNumber.ROUND_CEIL);
        data.data.level += 1;
        data.data.upgradeAmount = data.data.bonus.times(data.data.level);
      } else {
        break;
      }
    }
    recalcCounts();
    recalcBuyButtons();
    data.setText();
  });
  return data;
}