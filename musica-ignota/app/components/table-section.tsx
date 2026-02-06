import type { FontData } from "~/types";

export function TableSection({ label, data }: { label: string, data: FontData[] }) {
    const sectionData = data.map(obj => 
        <tr key={obj.char} className="d-flex">
            <th className="col-2" scope="row">{obj.char}</th>
            <td className="col-2 ignota">{obj.char}</td>
            <td className="col">{obj.info}</td>
        </tr>
    );

    return (
        <div>
            <h2><i>{`${label.charAt(0).toUpperCase()}${label.slice(1)}s`}</i></h2>
            <table className="table">
                <thead>
                    <tr className="d-flex">
                        <th className="col-2" scope="col">Latin</th>
                        <th className="col-2" scope="col">Ignota</th>
                        <th className="col" scope="col">Description</th>
                    </tr>
                </thead>
                <tbody className="table-group-divider">
                    {sectionData}
                </tbody>
            </table>
        </div>
    );
}