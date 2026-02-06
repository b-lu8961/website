import { useState } from "react";
import { Link } from "react-router";

function HeaderLink({ label, icon, ref, onMouseOver, onMouseOut }: 
    { label: string, icon: string, ref: string, onMouseOver: (text: string) => void, onMouseOut: () => void }
) {
    return (
        <Link onMouseOver={_ => {onMouseOver(label)}} onMouseOut={onMouseOut} className="link-dark" to={ref}>
            <i className={`p-2 bi ${icon}`} />
        </Link>
    );
}

export function Header() {
    const [headerText, setHeaderText] = useState("◌")

    function handleMouseOver(text: string) {
        setHeaderText(text);
    }

    function handleMouseOut() {
        setHeaderText("◌");
    }

    return (
        <div className="col text-center">
            <div className="row">
                <div className="col text-start d-flex align-items-center">
                    <HeaderLink label="Player" icon="bi-play-btn" ref="/" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}/>
                    <HeaderLink label="Lexicon" icon="bi-book" ref="/lexicon" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}/>
                    <HeaderLink label="Info" icon="bi-info-square" ref="/info" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}/>
                </div>
                <h1 className="col display-4"><a className="link-dark link-underline-opacity-0" href="/">{headerText}</a></h1>
                <div className="col text-end d-flex flex-row-reverse align-items-center">
                    <HeaderLink label="Font Guide" icon="bi-question-circle" ref="/cheatsheet" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}/>
                </div>
            </div>
            <hr className="mt-0 border-3"/>
        </div>
    );
}