import lexData from "../../../public/lexicon.json";
import { SearchPanel } from "./search-panel";
import { WordPanel } from "./word-panel";

export function LexiconDisplay() {
    return (
        <div className="row">
            <SearchPanel/>
            <WordPanel lexData={lexData}/>
        </div>
    );
}