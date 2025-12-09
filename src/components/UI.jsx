import { splitProps, createSignal, createEffect, onCleanup, For, createMemo, createRenderEffect, children } from "solid-js";

export function NumberInput(props) {
  const [placeholder, setPlaceholder] = createSignal('');

  const [specialProps, passedProps] = splitProps(props, [
      'unit', 'title'
    ]);

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend pb-1 font-mono text-base-content/80">{specialProps.title}</legend>
      <div className="input bg-transparent">
        <input
          {...passedProps}
          className="font-mono"
          type="number"
          placeholder={placeholder()}
        />
        {specialProps.unit && (<div className="unit font-mono text-base-content/50">{specialProps.unit}</div>)}
      </div>
    </fieldset>
  );
}
