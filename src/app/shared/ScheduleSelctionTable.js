import { MultiSet } from "mnemonist";

export const times = [8, 9, 10, 11, 12, 1, 2, 3, 4];
export const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
export const possibleLabTimes = [8, 11, 2];
const break_times = new Set([1]);

export default function ScheduleSelectionTable({
  filled,
  selected,
  onChange,
  labTimes,
  dualCheck,
}) {
  filled = (filled && MultiSet.from(filled)) || MultiSet.from([]);
  selected = (selected && MultiSet.from(selected)) || MultiSet.from([]);
  labTimes =
    (labTimes && MultiSet.from(labTimes)) ||
    MultiSet.from(days.map((day) => `${day} 2`));
  onChange =
    onChange || ((day, time, checked) => console.log(day, time, checked));
  dualCheck = (dualCheck && MultiSet.from(dualCheck)) || MultiSet.from([]);

  const changedOnChange = (day, time, checked, index) => {
    if (
      dualCheck.has(`${day} ${time}`)
        ? filled.count(`${day} ${time}`) !== 2
        : !(
            selected.count(`${day} ${time}`) ===
              filled.count(`${day} ${time}`) && filled.has(`${day} ${time}`)
          )
    ) {
      onChange(day, time, checked);
    }
  };

  return (
    <table className="table routine-table">
      <thead>
        <tr>
          <th scope="col" className="col-2">
            Day \ Time
          </th>
          {times.map((time) => (
            <th key={time} scope="col">{time}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map((day) => (
          <tr key={day}>
            <th key={`${day}-header`} scope="row" className="col-2">
              {day}
            </th>
            {times
              .filter(
                (time) =>
                  !labTimes.has(`${day} ${(time - 1 + 12) % 12}`) &&
                  !labTimes.has(`${day} ${(time - 2 + 12) % 12}`)
              )
              .map((time) => (
                <td key={`${day}-${time}`} colSpan={labTimes.has(`${day} ${time}`) ? 3 : 1}>
                  <input
                    className="big-checkbox"
                    type="checkbox"
                    checked={
                      dualCheck.has(`${day} ${time}`)
                        ? selected.has(`${day} ${time}`) || filled.count(`${day} ${time}`) === 2
                        : filled.has(`${day} ${time}`) ||
                          selected.has(`${day} ${time}`)
                    }
                    onChange={(e) =>
                      changedOnChange(day, time, e.target.checked, 0)
                    }
                    title={break_times.has(time) ? "Break Time" : undefined}
                    disabled={
                      dualCheck.has(`${day} ${time}`)
                        ? filled.count(`${day} ${time}`) === 2
                        : !selected.has(`${day} ${time}`) &&
                          (break_times.has(time) ||
                            filled.has(`${day} ${time}`))
                    }
                  />
                  {dualCheck.has(`${day} ${time}`) && (
                    <input
                      className="big-checkbox ml-2"
                      type="checkbox"
                      checked={filled.has(`${day} ${time}`)}
                      onChange={(e) =>
                        changedOnChange(day, time, e.target.checked, 1)
                      }
                      disabled={filled.has(`${day} ${time}`)}
                    />
                  )}
                </td>
              ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
