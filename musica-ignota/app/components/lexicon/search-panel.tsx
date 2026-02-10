export function SearchPanel() {
    return (
        <div className="col-3">
            <div className="input-group mb-2">
                <input type="text" className="form-control"/>
                <button className="btn btn-secondary"><i className="bi bi-search"/></button>
            </div>
            <div className="form-check">
                <input className="form-check-input" type="checkbox" id="contourCheck" />
                <label className="form-check-label" htmlFor="contourCheck">Countours</label>
            </div>
            <div className="form-check">
                <input className="form-check-input" type="checkbox" id="sequenceCheck" />
                <label className="form-check-label" htmlFor="sequenceCheck">Sequences</label>
            </div>
            <div className="form-check">
                <input className="form-check-input" type="checkbox" id="particleCheck" />
                <label className="form-check-label" htmlFor="particleCheck">Particles</label>
            </div>
        </div>
    );
}