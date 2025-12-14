import { createEffect, createSignal, splitProps } from "solid-js";


export function Navbar(props) {
  return (
    <header className={`navbar ${props.className}`}>
      {props.children}
    </header>
  );
}


const parseAttrNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function NumberInput(props) {
  const [specialProps, inputProps] = splitProps(props, [
    "unit", "title", "allowInf", "value", "onChange", "ref", "onInput", "initialFinite"
  ]);

  const [inputValue, setInputValue] = createSignal("");
  const [lastFiniteValue, setLastFiniteValue] = createSignal(specialProps.initialFinite);
  const [isInf, setIsInf] = createSignal(false);

  const emitChange = (nextValue) => {
    if (typeof specialProps.onChange === "function") {
      specialProps.onChange(nextValue);
    }
  };

  const emitNaN = () => {
    setIsInf(false);
    emitChange(NaN);
  };

  const commitFiniteValue = (value, shouldEmit = true) => {
    setIsInf(false);
    setInputValue(`${value}`);
    setLastFiniteValue(value);
    if (shouldEmit) {
      emitChange(value);
    }
  };

  const handleInput = (event) => {
    const raw = event.currentTarget.value;
    setInputValue(raw);
    specialProps.onInput?.(event);

    if (!raw) {
      emitNaN();
      return;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      emitNaN();
      return;
    }

    const min = parseAttrNumber(inputProps.min);
    if (min !== undefined && parsed < min) {
      emitNaN();
      return;
    }

    commitFiniteValue(parsed);
  };

  const toggleInfinity = () => {
    if (!specialProps.allowInf) {
      return;
    }

    if (isInf()) {
      const previous = lastFiniteValue();
      if (previous === undefined) {
        setInputValue("");
        emitNaN();
      } else {
        commitFiniteValue(previous);
      }
      return;
    }

    setIsInf(true);
    setInputValue("");
    emitChange(Infinity);
  };

  createEffect(() => {
    const external = specialProps.value;
    if (external === Infinity) {
      setIsInf(true);
      setInputValue("");
      return;
    }
    if (Number.isFinite(external)) {
      commitFiniteValue(external, false);
      return;
    }
    setIsInf(false);
    setInputValue("");
  });

  const controlApi = {
    clearInfinity: () => {
      if (isInf()) {
        toggleInfinity();
      }
    },
    isInfinity: () => isInf(),
  };

  createEffect(() => {
    if (!specialProps.ref) {
      return;
    }
    if (typeof specialProps.ref === "function") {
      specialProps.ref(controlApi);
    } else if (typeof specialProps.ref === "object") {
      specialProps.ref.current = controlApi;
    }
  });

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend pb-1 text-base-content/80">{specialProps.title}</legend>

        <div className={`input bg-transparent flex items-center gap-2 ${specialProps.allowInf ? "pr-0" : ""}`}>
          <input
            {...inputProps}
            value={inputValue()}
            className="font-mono"
            type="number"
            onInput={handleInput}
            placeholder={ isInf() ? "Inf" : ""}
          />
          {specialProps.unit && (
            <div className="unit text-base-content/50">{specialProps.unit}</div>
          )}
          {specialProps.allowInf && (
            <button
              type="button"
              className={`btn btn-soft btn-xs text-[.6em] h-full ${!isInf() ? "btn-active text-gray-500" : ""} shadow-none my-1`}
              aria-pressed={isInf()}
              onClick={toggleInfinity}
            >
              Inf
            </button>
          )}
        </div>


    </fieldset>
  );
}


export function Skeleton(props){
  const [specialProps, passProps] = splitProps(props, ['className']);

  return (
    <div className={`skeleton ${specialProps.className}`} {...passProps}></div>
  );
}


export function Table(props){
  return (
    <table className="table table-zebra rounded-box border border-base-content/5 bg-base-100">

      <thead>
        <tr>
          {props.header?.map((item, index) => (
            <th key={index}>{item}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {props.data?.map((row, index) => (
          <tr key={index}>
            {row.map((item, index) => (
              <td key={index}>{item}</td>
            ))}
          </tr>
        ))}
      </tbody>

    </table>
  );
}


export function Toggle(props){
  const [specialProps, passProps] = splitProps(props, [
    "className",
    "label"
  ]);

  return (
    <label class="label">
      <input type="checkbox" className={`toggle ${specialProps.className}`} {...passProps} />
      {specialProps.label}
    </label>
  );
}
