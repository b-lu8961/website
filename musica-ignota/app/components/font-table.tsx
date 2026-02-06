import type { FontData } from "~/types";
import { TableSection } from "./table-section";

export function FontTable({ data }: { data: FontData[] }) {
    const categories = Array.from(new Set(data.map(obj => obj.category)));
    const tableContent = categories.map(cat => {
        const catData = data.filter(obj => obj.category === cat);

        return (
            <div key={cat}>
                <TableSection label={cat} data={catData} />
            </div>
        );
    });

    return (
        <div>
            {tableContent}
        </div>
    );
}