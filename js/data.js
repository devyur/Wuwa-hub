// ============================================================
//  WUTHERING WAVES — DATA FILE
//  Edit heroes, weapons, and buffs here.
//  Icons go in:
//    icons/heroes/<id>.png
//    icons/weapons/<id>.png
//    icons/buffs/<id>.png
//    icons/elements/<ElementName>.png  (e.g. Havoc.png)
// ============================================================

var HEROES = [
  // rarity: "4*" or "5*"   canUseMultiple: hero can appear in 2 teams
  { id: "aalto",          name: "Aalto",           element: "Aero",     rarity: "4*", canUseMultiple: false },
  { id: "taoqi",          name: "Taoqi",           element: "Havoc",    rarity: "4*", canUseMultiple: false },
  { id: "chixia",         name: "Chixia",          element: "Fusion",   rarity: "4*", canUseMultiple: false },
  { id: "danjin",         name: "Danjin",          element: "Havoc",    rarity: "4*", canUseMultiple: false },
  { id: "mortefi",        name: "Mortefi",         element: "Fusion",   rarity: "4*", canUseMultiple: false },
  { id: "sanhua",         name: "Sanhua",          element: "Glacio",   rarity: "4*", canUseMultiple: false },
  { id: "yangyang",       name: "Yangyang",        element: "Aero",     rarity: "4*", canUseMultiple: false },
  { id: "yuanwu",         name: "Yuanwu",          element: "Electro",  rarity: "4*", canUseMultiple: false },
  { id: "baizhi",         name: "Baizhi",          element: "Glacio",   rarity: "4*", canUseMultiple: true },
  { id: "jianxin",        name: "Jianxin",         element: "Aero",     rarity: "4*", canUseMultiple: false },
  { id: "lingyang",       name: "Lingyang",        element: "Glacio",   rarity: "5*", canUseMultiple: false },
  { id: "calcharo",       name: "Calcharo",        element: "Electro",  rarity: "5*", canUseMultiple: false },
  { id: "encore",         name: "Encore",          element: "Fusion",   rarity: "5*", canUseMultiple: false },
  { id: "verina",         name: "Verina",          element: "Spectro",  rarity: "5*", canUseMultiple: true },
  { id: "rover_havoc",    name: "Rover (Havoc)",   element: "Havoc",    rarity: "5*", canUseMultiple: false },
  { id: "rover_spectro",  name: "Rover (Spectro)", element: "Spectro",  rarity: "5*", canUseMultiple: false },
  { id: "rover_aero",     name: "Rover (Aero)",    element: "Aero",     rarity: "5*", canUseMultiple: false },
  { id: "jiyan",          name: "Jiyan",           element: "Aero",     rarity: "5*", canUseMultiple: false },
  { id: "yinlin",         name: "Yinlin",          element: "Electro",  rarity: "5*", canUseMultiple: false },
  { id: "jinhsi",         name: "Jinhsi",          element: "Spectro",  rarity: "5*", canUseMultiple: false },
  { id: "changli",        name: "Changli",         element: "Fusion",   rarity: "5*", canUseMultiple: false },
  { id: "zhezhi",         name: "Zhezhi",          element: "Glacio",   rarity: "5*", canUseMultiple: false },
  { id: "youhu",          name: "Youhu",           element: "Glacio",   rarity: "4*", canUseMultiple: false },
  { id: "xiangli_yao",    name: "Xiangli Yao",     element: "Electro",  rarity: "5*", canUseMultiple: false },
  { id: "shorekeeper",    name: "Shorekeeper",     element: "Spectro",  rarity: "5*", canUseMultiple: true  },
  { id: "camellya",       name: "Camellya",        element: "Havoc",    rarity: "5*", canUseMultiple: false },
  { id: "lumi",           name: "Lumi",            element: "Electro",  rarity: "4*", canUseMultiple: false },
  { id: "carlotta",       name: "Carlotta",        element: "Glacio",   rarity: "5*", canUseMultiple: false },
  { id: "roccia",         name: "Roccia",          element: "Havoc",    rarity: "5*", canUseMultiple: false },
  { id: "brant",          name: "Brant",           element: "Fusion",   rarity: "5*", canUseMultiple: false },
  { id: "phoebe",         name: "Phoebe",          element: "Spectro",  rarity: "5*", canUseMultiple: false },
  { id: "cantarella",     name: "Cantarella",      element: "Havoc",    rarity: "5*", canUseMultiple: false },
  { id: "zani",           name: "Zani",            element: "Spectro",  rarity: "5*", canUseMultiple: false },
  { id: "ciaccona",       name: "Ciaccona",        element: "Aero",     rarity: "5*", canUseMultiple: false },
  { id: "cartethyia",     name: "Cartethyia",      element: "Aero",     rarity: "5*", canUseMultiple: false },
  { id: "lupa",           name: "Lupa",            element: "Fusion",   rarity: "5*", canUseMultiple: false },
  { id: "phrolova",       name: "Phrolova",        element: "Havoc",    rarity: "5*", canUseMultiple: false },
  { id: "augusta",        name: "Augusta",         element: "Electro",  rarity: "5*", canUseMultiple: false },
  { id: "iuno",           name: "Iuno",            element: "Aero",     rarity: "5*", canUseMultiple: false },
  { id: "galbrena",       name: "Galbrena",        element: "Fusion",   rarity: "5*", canUseMultiple: false },
  { id: "qiuyuan",        name: "Qiuyuan",         element: "Aero",     rarity: "5*", canUseMultiple: false },
  { id: "chisa",          name: "Chisa",           element: "Havoc",    rarity: "5*", canUseMultiple: false },
  { id: "buling",         name: "Buling",          element: "Electro",  rarity: "4*", canUseMultiple: true  },
  { id: "lynae",          name: "Lynae",           element: "Spectro",  rarity: "5*", canUseMultiple: false },
  { id: "mornye",         name: "Mornye",          element: "Fusion",   rarity: "5*", canUseMultiple: true  },
  { id: "aemeath",        name: "Aemeath",         element: "Fusion",   rarity: "5*", canUseMultiple: false },
  { id: "luuk_herssen",   name: "Luuk Herssen",    element: "Spectro",  rarity: "5*", canUseMultiple: false },
  { id: "sigrika",        name: "Sigrika",         element: "Aero",     rarity: "5*", canUseMultiple: false },
  { id: "hiyuki",         name: "Hiyuki",          element: "Glacio",   rarity: "5*", canUseMultiple: false },
  { id: "denia",          name: "Denia",           element: "Fusion",   rarity: "5*", canUseMultiple: false },
];

// signature: true = counts as +1 cost
var WEAPONS = [
  { id: "no_weapon",      name: "None",            signature: false  },
  { id: "signature",      name: "Signature",       signature: true   },
  { id: "standard",       name: "Standard",        signature: false  },
  { id: "fourstar",       name: "Fourstar",        signature: false  },
];

var BUFFS = [
  { id: "buff_coordinated", name: "Coordinated", desc: "Coordinated attack buffs" },
  { id: "buff_echo",        name: "Echo Buff",   desc: "Echo skill amplification"  },
  { id: "buff_forte",       name: "Forte Boost", desc: "Forte circuit enhancement" },
  { id: "buff_resonance",   name: "Resonance",   desc: "Resonance skill boost"     },
];

var ELEMENT_COLORS = {
  Havoc:   "#9b5de5",
  Spectro: "#f9c74f",
  Glacio:  "#90e0ef",
  Electro: "#7bdff2",
  Aero:    "#80ffdb",
  Fusion:  "#f4845f",
};

// Cost = +1 per 5* hero, +seq if seq>0, +1 per signature weapon
function calcTeamCost(team) {
  var cost = 0;
  for (var i = 0; i < team.heroes.length; i++) {
    var slot = team.heroes[i];
    if (!slot) continue;
    var hero = null;
    for (var h = 0; h < HEROES.length; h++) { if (HEROES[h].id === slot.heroId) { hero = HEROES[h]; break; } }
    if (!hero) continue;
    if (hero.rarity === "5*") cost += 1;
    var seq = slot.seq || 0;
    if (seq > 0) cost += seq;
    var weapon = null;
    for (var w = 0; w < WEAPONS.length; w++) { if (WEAPONS[w].id === slot.weapon) { weapon = WEAPONS[w]; break; } }
    if (weapon && weapon.signature) cost += 1;
  }
  return cost;
}
