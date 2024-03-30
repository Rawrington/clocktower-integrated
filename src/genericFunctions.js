import standardRoles from './roles.json';
import fabledJson from './fabled.json';
import editions from './editions.json';
import specials from './specials.json';
import jinxes from './jinxes.json';

const cachedRoles = {};

// maybe rewrite some of this code with more array functions but im not smart!
export function getEditionImage(edition) {
  return (new URL(`./assets/editions/${edition}.png`, import.meta.url).href);
}

export function getImage(role) {
  const r = getRole(role);
  const f = getFabled(role);

  if (!r && !f) {
    return (new URL(`./assets/reminders/${role}.png`, import.meta.url).href);
  }

  if ((!r && !f) || (r && !r.image || f && !f.image)) { 
    return (new URL(`./assets/roles/${role}.png`, import.meta.url).href);
  }

  if (r && r.image && Array.isArray(r.image)) {
    return r.image[0];
  }

  if (f && f.image) {
    return f.image;
  }

  return r.image;
}

const cachedTown = {};
let cachedFabled = [];
let cachedSpecials = [];
let cachedJinxes = [];
const cachedGlobalReminders = {};

export function clearCache() {
  cachedTown['customScript'] = null;
  cachedRoles['customScript'] = null;
  cachedRoles['custom'] = null;
  cachedGlobalReminders['customScript'] = null;
  cachedFabled = [];
  cachedSpecials = [];
  cachedJinxes = [];
}

export function getJinxes(edition) {
  if (typeof edition === 'string') {
    return [];
  }

  return cachedJinxes;
}

export function getSpecial(role, type, name) {
  return specials.find(special => special.role === role && special.type === type && special.name === name) || cachedSpecials.find(special => special.role === role && special.type === type && special.name === name);
}

export function getRole(role) {
  const defRole = standardRoles.find((r) => r.id === role);

  if(defRole) {
    return defRole;
  }

  return cachedRoles['custom'] && cachedRoles['custom'].find((r) => r.id === role) || undefined;
}

export function getFabledList() {
  return [...cachedFabled, ...fabledJson];
}

export function getFabled(fabled) {
  return (getFabledList().find((f) => f.id === fabled) || undefined);
}

export function getTravellersNotIn(edition) {
  if(typeof edition === 'object') {
    return standardRoles.filter((r) => r.team === 'traveler').map(r => r.id);
  }

  return standardRoles.filter((r) => r.team === 'traveler' && r.edition !== edition).map(r => r.id);
}

let currentCustom = '';

export function getEdition(edition) {
  if (!edition || edition === '') {
    return [];
  }

  const dataEdition = typeof edition === "object" ? edition : editions.find((ed) => ed.id === edition);

  let defaultRoles = dataEdition.roles || [];

  if (cachedRoles[edition]) {
    defaultRoles = cachedRoles[edition];
  }
  else if(typeof edition === "object") {
    const meta = edition.find(role => role.id === '_meta');

    if (meta && meta.name && meta.name !== currentCustom) {
        clearCache();
        currentCustom = meta.name;
    }

    if (!cachedRoles['custom']) {
      cachedRoles['custom'] = edition.filter(role => role.id !== '_meta' && typeof role !== 'string' && role.team !== 'fabled');
      cachedFabled = edition.filter(role => role.id !== '_meta' && typeof role !== 'string' && role.team === 'fabled');
      cachedSpecials = edition.reduce((specialsArray, role) => {
        if (role.special) {
          return specialsArray.concat(role.special.map(special => {
            return {
              ...special,
              role: role.id,
            }
          }));
        }

        return specialsArray;
      }, []);
      cachedJinxes = edition.reduce((jinxesArray, jinxed) => {
        if (jinxed.jinxes) {
          const filteredJinxes = jinxed.jinxes.filter(jinx => edition.some(role => (typeof role === 'string' && jinx.id === role) || (typeof role === 'object' && jinx.id === role.id)));

          if (filteredJinxes.length > 0) {
            return jinxesArray.concat({
              id: jinxed.id,
              jinxes: filteredJinxes.jinxes,
            });
          }
        }

        return jinxesArray;
      }, []);
      edition.forEach(role => {
        if(typeof role === 'string') {
          const jinxed = jinxes.find(jinx => jinx.id === role);

          if (jinxed) {
            const filteredJinxes = jinxed.jinxes.filter(jinx => edition.some(role => typeof role === 'string' && jinx.id === role));

            if (filteredJinxes.length > 0) {
              cachedJinxes = cachedJinxes.concat({
                id: role,
                jinxes: filteredJinxes,
              });
            }
          }
        }
      });
    }

    if (cachedRoles['customScript']) {
      defaultRoles = cachedRoles['customScript'];
    }
    else {
      defaultRoles = edition.filter(role => role.id !== '_meta' && role.team !== 'fabled').map((role) => {
        if(typeof role === 'string') {
          return role;
        }

        return role.id;
      });

      defaultRoles = defaultRoles.filter((role, i) => defaultRoles.indexOf(role) === i && !getFabled(role));

      defaultRoles.sort((a, b) => {
        return (getRole(b) || b).team.localeCompare((getRole(a) || a).team);
      });

      cachedRoles['customScript'] = defaultRoles;
    }

    return {
      id: 'customScript',
      author: (meta && meta.author) || 'Unknown',
      name: (meta && meta.name) || 'Custom Script',
      logo: meta && meta.logo,
      background: meta && meta.background,
      roles: defaultRoles,
    };
  }
  else {
    standardRoles.forEach((r) => {
      if (r.edition === edition) {
        defaultRoles = defaultRoles.concat(r.id);
      }
    });

    defaultRoles.sort((a, b) => {
      return getRole(b).team.localeCompare(getRole(a).team);
    });
    // ensure array is in standard townsfolk -> outsiders -> minions -> demons order, placement of travelers is irrelevant they are requested seperately!

    cachedRoles[edition] = defaultRoles;
  }

  return { ...dataEdition, roles: defaultRoles };
}

export function getTown(editionObject, roleFilter) {
  const edition = typeof editionObject === 'string' ? editionObject : 'customScript';

  cachedTown[edition] = cachedTown[edition] || {};

  // no filter = remove travellers
  if (!roleFilter || roleFilter == undefined) {
    if (!cachedTown[edition].town) {
      cachedTown[edition].town = getEdition(editionObject).roles.filter((role) => {
        const dataRole = getRole(role);

        return dataRole && dataRole.team != 'traveler';
      });
    }

    return cachedTown[edition].town;
  }

  if (!cachedTown[edition][roleFilter]) {
    cachedTown[edition][roleFilter] = getEdition(editionObject).roles.filter((role) => {
      const dataRole = getRole(role);

      return dataRole && dataRole.team == roleFilter;
    });
  }

  return cachedTown[edition][roleFilter];
}

export function getCurrentTravellersWithRole(roleList) {
  return roleList.filter((role) => getRole(role).team == 'traveler');
}

export function getGlobalReminders(editionObject) {
  const edition = typeof editionObject === 'string' ? editionObject : 'customScript';

  const dataEdition = getEdition(editionObject);

  if (cachedGlobalReminders[edition]) {
    return cachedGlobalReminders[edition];
  }

  let globalReminders = [];

  dataEdition.roles.forEach((role) => {
    const dataRole = getRole(role) ? getRole(role) : getFabled(role);

    if (dataRole.remindersGlobal) {
      globalReminders = globalReminders.concat(dataRole.remindersGlobal.map((reminderText) => {
        return { reminder: role, text: reminderText };
      }));
    }
  });

  cachedGlobalReminders[edition] = globalReminders;

  return globalReminders;
}

export function getReminders(roles, fabled) {
  let reminders = [
    { reminder: 'good', text: 'Good' },
    { reminder: 'evil', text: 'Evil' },
    { reminder: 'outsider', text: 'Outsider' },
  ];

  roles.forEach((role) => {
    const dataRole = getRole(role);

    if (dataRole && dataRole != -1 && dataRole.reminders) {
      if (!reminders.some((note) => {
        return note.reminder === dataRole.id;
      })) {
        reminders = reminders.concat(dataRole.reminders.map((reminderText) => {
          return { reminder: dataRole.id, text: reminderText };
        }));
      }
    }
  });

  fabled.forEach((role) => {
    const dataRole = getFabled(role);

    if (dataRole && dataRole != -1 && dataRole.reminders) {
      if (!reminders.some((note) => {
        return note.reminder === dataRole.id;
      })) {
        reminders = reminders.concat(dataRole.reminders.map((reminderText) => {
          return { reminder: dataRole.id, text: reminderText };
        }));
      }
    }
  });

  return reminders;
}

// thank you random javascript website for this example very useful!
export function getBox(box) {
  const ret = {};

  for (const prop in box) {
    ret[prop] = box[prop];
  }

  ret.xCenter = (box.left + box.right) / 2;
  ret.yCenter = (box.top + box.bottom) / 2;

  return ret;
}