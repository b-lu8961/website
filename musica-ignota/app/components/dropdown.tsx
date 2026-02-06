import type { PlayerData } from "~/types";

export function Dropdown({ options, name, text }: { options: PlayerData[], name: string, text: string }) {
    let defaultValue = "";
    const optionContent = options.map(opt => {
        if (opt.initial) {
            defaultValue = opt.key;
        }
        return <option key={opt.key} value={opt.key}>{opt.label}</option>
    }
    );
    return (
        <div className="col">
            <label htmlFor={name} className="form-label">{text}</label>
            <select id={name} name={name} defaultValue={defaultValue} className="form-select">
                {optionContent}
            </select>
        </div>
    );
}