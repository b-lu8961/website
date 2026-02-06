export function ButtonRow({ label, chars, clickHandler }: 
    { label: string, chars: string[], clickHandler: (c: string) => void }
) {
    const rowContent = chars.map(char => 
        <div key={char} className="col-auto">
            <button onClick={_ => clickHandler(char)} className="btn btn-secondary ignota">{char}</button>
        </div>
    );

    return (
        <div className="row align-items-center p-2">
            <div className="col-md-2">
                <h3>{label}: </h3>
            </div>
            {rowContent}
        </div>
    );
}