import tokenBackground from '../assets/token.png';

import leafLeft from '../assets/leaf/leaf-left.png';
import leafRight from '../assets/leaf/leaf-right.png';
import leafOrange from '../assets/leaf/leaf-orange.png';

import leafTop1 from '../assets/leaf/leaf-top1.png';
import leafTop2 from '../assets/leaf/leaf-top2.png';
import leafTop3 from '../assets/leaf/leaf-top3.png';
import leafTop4 from '../assets/leaf/leaf-top4.png';
import leafTop5 from '../assets/leaf/leaf-top5.png';

import { getImage } from '../genericFunctions';

const leafTop = [ undefined, leafTop1, leafTop2, leafTop3, leafTop4, leafTop5 ];

// yandere dev ass leaves frfr

// credit to the unofficial clocktower.online Town Square for the text svg
function Token({ role, click, description }) {
  const roleImage = getImage(role && role.id);

  const reminderLength = role && (((role.remindersGlobal && role.remindersGlobal.length) || 0) + (role.reminders && role.reminders.length));

  return (
    <>
      <div
        className={'token ' + (role && role.team)}
        style={{ backgroundImage: 'url(' + tokenBackground + ')' }}
        onClick={click}
      >
        {role &&
          <div
            className="role"
            style={{ backgroundImage: 'url(' + roleImage + ')' }}
          >
            {role.firstNight > 0 &&
              <span style={{ backgroundImage: 'url(' + leafLeft + ')' }}></span>
            }
            {role.otherNight > 0 &&
              <span style={{ backgroundImage: 'url(' + leafRight + ')' }}></span>
            }
            {role.setup &&
              <span style={{ backgroundImage: 'url(' + leafOrange + ')' }}></span>
            }
            {reminderLength > 0 &&
              <span style={{ backgroundImage: 'url(' + leafTop[reminderLength] + ')' }}></span>
            }
            <svg viewBox="0 0 150 150" className="name">
              <path
                d="M 13 75 C 13 160, 138 160, 138 75"
                id="curve"
                fill="transparent"
              />
              <text
                width="150"
                x="66.6%"
                textAnchor="middle"
                className="label mozilla"
              >
                <textPath xlinkHref="#curve">
                  { role.name }
                </textPath>
              </text>
            </svg>
          </div>
        }
      </div>
      {description && role &&
        <div className={'role-ability ' + description}>
          { role.ability }
        </div>
      }
    </>
  );
}

export default Token;