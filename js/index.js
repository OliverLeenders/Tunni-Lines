let svg = d3.select("svg");

svg.attr("width", "100%")
    .attr("height", "100%");

sel_el = false;

//================================================================================================//
//
// logic for dragging ui elements
//
//================================================================================================//


// console.trace();
// only need to do this once maybe #TODO



function start_drag(e) {
    sel_el = d3.select(e.target);
    // console.log(_history);
    if (sel_el.node().tagName == "circle") {
        start_drag_node(e);
        return;
    }
    else if (sel_el.node().tagName == "line") {
        start_drag_line(e);
        return;
    }
}

function drag(e) {
    if (sel_el) {
        if (sel_el.node().tagName == "circle") {
            drag_node(e);
        }
        else if (sel_el.node().tagName == "line") {
            drag_line(e);
        }
    }
}

function end_drag(e) {
    if (sel_el) {
        if (sel_el.node().tagName == "circle") {
            end_drag_node(e);
            _history.push(pp);
        }
        else if (sel_el.node().tagName == "line") {
            end_drag_line(e);
            _history.push(pp);
        }

    }
}


svg.on("mousedown", start_drag);
svg.on("mousemove", drag);
svg.on("mouseup", end_drag);

/**
 * Starts dragging a node and updates the radius of the node
 * @param {Event} e the event
 */
function start_drag_node(e) {
    if (sel_el && sel_el.node().tagName == "circle") {
        sel_el.attr("r", "10px")
    }
}

/**
 * Drags a node and updates all relevant control points
 * @param {MouseEvent} e the event
 */
function drag_node(e) {
    if (sel_el && sel_el.node().tagName == "circle") {
        // initializing all the important variables
        let upd_tunni = true;

        let sp_nr = parseInt(sel_el.attr("subpath_nr"));
        let subpath = pp.subpaths[sp_nr];

        let i = parseInt(sel_el.attr("spline_nr"));
        let j = i;
        let bezier = subpath.splines[i];

        let C1_line = subpath.C1_lines[i];
        let C2_line = subpath.C2_lines[i];
        let tunni_line = subpath.tunni_lines[i];
        let C1_ui_el = subpath.C1_ui_els[i];
        let C2_ui_el = subpath.C2_ui_els[i];
        let next_bezier = subpath.splines[i + 1];
        let e_point = get_event_svg_coords(e);

        // update the positions of the control points and the tunni point
        if (sel_el.attr("id") == "start" && subpath.splines.length == 0) {
            subpath.start = e_point;
        }
        else if (sel_el.attr("id") == "start") {
            if (subpath.splines.length == 0) {
                subpath.start = e_point;
            }
            let delta = point.sub(bezier.C1, bezier.start);
            let delta_2, last_index, last_bezier;
            if (subpath.closed) {
                last_index = subpath.splines.length - 1;
                last_bezier = subpath.splines[last_index];
                delta_2 = point.sub(last_bezier.C2, last_bezier.end);
            }

            bezier.start = e_point;
            subpath.start = e_point;
            bezier.C1 = point.add(bezier.start, delta);

            subpath.upd_SVG_line(C1_line, e_point, bezier.C1);
            subpath.upd_SVG_circle(C1_ui_el, bezier.C1);
            subpath.upd_SVG_line(tunni_line, bezier.C1, bezier.C2);
            if (subpath.closed) {
                last_bezier.end = bezier.start;
                last_bezier.C2 = point.add(last_bezier.end, delta_2);

                subpath.upd_SVG_line(subpath.C2_lines[last_index], bezier.start, last_bezier.C2);
                subpath.upd_SVG_circle(subpath.C2_ui_els[last_index], last_bezier.C2);
                subpath.upd_SVG_line(subpath.tunni_lines[last_index], last_bezier.C1, last_bezier.C2);
            }
        } else if (sel_el.attr("id") == "end") {
            let delta = point.sub(bezier.C2, bezier.end);
            let next_delta;
            // if next_bezier is defined ...
            if (i < subpath.splines.length - 1) {
                next_delta = point.sub(next_bezier.C1, bezier.end);
            }
            bezier.end = e_point;
            bezier.C2 = point.add(bezier.end, delta);
            if (i < subpath.splines.length - 1) {
                next_bezier.start = e_point;
                next_bezier.C1 = point.add(e_point, next_delta);

                subpath.upd_SVG_line(subpath.C1_lines[i + 1], next_bezier.start, next_bezier.C1);
                subpath.upd_SVG_circle(subpath.C1_ui_els[i + 1], next_bezier.C1);
                subpath.upd_SVG_line(subpath.tunni_lines[i + 1], next_bezier.C1, next_bezier.C2);
            }

            subpath.upd_SVG_line(C2_line, e_point, bezier.C2);
            subpath.upd_SVG_circle(C2_ui_el, bezier.C2);
            subpath.upd_SVG_line(tunni_line, bezier.C1, bezier.C2);
        } else if (sel_el.attr("id") == "C1") {
            let C1 = bezier.C1;
            let start = bezier.start;
            let delta = point.sub(C1, start);
            let delta_2 = point.sub(e_point, start);
            let adjacent_spline = (i > 0) ? subpath.splines[i - 1]
                : (subpath.closed) ? subpath.splines[subpath.splines.length - 1] : undefined;
            if (bezier.is_start_hv_locked) {
                // if C1 point is locked to horizontal
                HV_lock(delta, delta_2, e_point, start);
            }
            if (bezier.start_point_type == point.point_types.smooth) {
                // if bezier is not first spline
                if (i > 0 || subpath.closed) {
                    // fetch bezier
                    j = (i > 0) ? i - 1 : subpath.splines.length - 1;
                    prev_bezier = subpath.splines[j];
                    prev_C2_ui_el = subpath.C2_ui_els[j];
                    prev_C2_line = subpath.C2_lines[j];

                    prev_C2 = prev_bezier.C2;
                    prev_C2_length = point.length(prev_C2, prev_bezier.end);
                    dC1 = point.sub(C1, start);
                    let p_new = point.sub(start, dC1);
                    p_new = point.stretch_to_length(start, p_new, prev_C2_length);
                    prev_bezier.C2 = p_new;
                    subpath.upd_SVG_circle(prev_C2_ui_el, prev_bezier.C2);
                    subpath.upd_SVG_line(prev_C2_line, start, prev_bezier.C2);
                    subpath.upd_SVG_line(subpath.tunni_lines[j], prev_bezier.C1, prev_bezier.C2);
                }
            }
            bezier.C1 = e_point;
            subpath.upd_SVG_line(C1_line, bezier.start, e_point);
            subpath.upd_SVG_line(tunni_line, e_point, bezier.C2);
        } else if (sel_el.attr("id") == "C2") {
            let C2 = bezier.C2;
            let end = bezier.end;
            let delta = point.sub(bezier.C2, bezier.end);
            let delta_2 = point.sub(e_point, bezier.end);

            if (bezier.is_end_hv_locked) {
                // if C2 point is locked to horizontal
                HV_lock(delta, delta_2, e_point, end);
            }
            if (bezier.end_point_type == point.point_types.smooth) {
                // if bezier is not last spline
                if (i < subpath.splines.length - 1 || subpath.closed) {
                    // fetch bezier
                    j = (i < subpath.splines.length - 1) ? i + 1 : 0;
                    next_bezier = subpath.splines[j];
                    next_C1_ui_el = subpath.C1_ui_els[j];
                    next_C1_line = subpath.C1_lines[j];

                    next_C1 = next_bezier.C1;
                    next_C1_length = point.length(next_C1, next_bezier.start);
                    dC2 = point.sub(C2, end);
                    let p_new = point.sub(end, dC2);
                    p_new = point.stretch_to_length(end, p_new, next_C1_length);
                    next_bezier.C1 = p_new;
                    subpath.upd_SVG_circle(next_C1_ui_el, next_bezier.C1);
                    subpath.upd_SVG_line(next_C1_line, end, next_bezier.C1);
                    subpath.upd_SVG_line(subpath.tunni_lines[j], next_bezier.C1, next_bezier.C2);
                }

            }
            bezier.C2 = e_point;
            subpath.upd_SVG_line(C2_line, bezier.end, e_point);
            subpath.upd_SVG_line(tunni_line, bezier.C1, e_point);
        } else if (sel_el.attr("id") == "tunni") {
            upd_tunni = false;
            bezier.tunni_point = e_point;

            let C1_halfway_point = point.div(point.add(bezier.tunni_point, bezier.start), 2)
            let C2_vector = point.add(point.sub(bezier.C2, bezier.end), C1_halfway_point);
            let C1_intersection = geometry.intersection(C1_halfway_point, C2_vector,
                bezier.start, bezier.C1);

            bezier.C1 = C1_intersection;

            subpath.upd_SVG_circle(C1_ui_el, bezier.C1);
            subpath.upd_SVG_line(C1_line, bezier.start, bezier.C1);

            let C2_halfway_point = point.div(point.add(bezier.tunni_point, bezier.end), 2)
            let C1_vector = point.add(point.sub(bezier.C1, bezier.start), C2_halfway_point);
            let C2_intersection = geometry.intersection(C2_halfway_point,
                C1_vector, bezier.end, bezier.C2);

            bezier.C2 = C2_intersection;

            subpath.upd_SVG_circle(C2_ui_el, bezier.C2);
            subpath.upd_SVG_line(C2_line, bezier.end, bezier.C2);
            subpath.upd_SVG_line(tunni_line, bezier.C1, bezier.C2);
        }
        // update the position of the svg element
        subpath.upd_SVG_circle(sel_el, e_point);
        // update the path
        subpath.update_path(upd_tunni, i, j);
    }


}

let HV_lock = (delta, delta_2, e_point, start) => {
    if (Math.abs(delta.y) < Math.abs(delta.x)) {
        if (Math.abs(delta_2.y) > Math.abs(delta.x)) {
            // C1 point should be locked to vertical
            e_point.x = start.x;
            e_point.y = e_point.y;
        } else {
            // C1 point should remain locked to horizontal
            console.log("2");
            e_point.y = start.y;
        }
    } else if (Math.abs(delta.x) < Math.abs(delta.y)) { // if C1 point is locked to vertical
        if (Math.abs(delta_2.x) > Math.abs(delta.y)) {
            // C1 point should be locked to horizontal
            e_point.y = start.y;
            e_point.x = e_point.x;
        } else {
            // C1 point should remain locked to vertical
            e_point.x = start.x;
        }
    }
}

/**
 * Ends dragging the node, node is no longer selected
 * @param {MouseEvent} e the mouse event
 */
end_drag_node = (e) => {
    if (sel_el && sel_el.node().tagName == "circle") {
        sel_el.attr("r", "5px");
        sel_el = false;
    }
}

function get_event_svg_coords(e) {
    let dim = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - dim.left;
    let y = e.clientY - dim.top;
    return new point(x, y);
}

/**
 * Starts dragging the tunni line
 * @param {MouseEvent} e the mouse event
 */
function start_drag_line(e) {
    if (sel_el && sel_el.node().tagName == "line") {
        sel_el
            .attr("stroke-width", "5px")
            .attr("opacity", "1");
    }
}

/**
 * Drags the tunni line and scales the bezier handles accordingly
 * @param {MouseEvent} e the mouse event
 */
function drag_line(e) {
    let e_point = get_event_svg_coords(e);
    if (sel_el && sel_el.node().tagName == "line") {
        console.log(e_point.to_string());
        let i = parseInt(sel_el.attr("spline_nr"));
        let sp_nr = parseInt(sel_el.attr("subpath_nr"));
        let subpath = pp.subpaths[sp_nr];
        console.log(subpath);
        let bezier = subpath.splines[i];
        let tl_vector = point.sub(point.add(e_point, bezier.C2), bezier.C1);
        bezier.C1 = geometry.intersection(e_point, tl_vector, bezier.start, bezier.C1);
        bezier.C2 = geometry.intersection(e_point, tl_vector, bezier.end, bezier.C2);
        subpath.upd_SVG_circle(subpath.C1_ui_els[i], bezier.C1);
        subpath.upd_SVG_circle(subpath.C2_ui_els[i], bezier.C2);
        subpath.upd_SVG_line(subpath.C1_lines[i], bezier.start, bezier.C1);
        subpath.upd_SVG_line(subpath.C2_lines[i], bezier.end, bezier.C2);
        subpath.upd_SVG_line(subpath.tunni_lines[i], bezier.C1, bezier.C2);
        subpath.update_path(true, i);
    }
}

/**
 * Ends the dragging of the Tunni Lines and resets the state of the system
 * @param {MouseEvent} e mouseup-event
 */
function end_drag_line(e) {
    if (sel_el && sel_el.node().tagName == "line") {
        sel_el
            .attr("stroke-width", "3px")
            .attr("opacity", "0.5");
        sel_el = false;
    }
}


//================================================================================================//
// create instances
//================================================================================================//

// add big instruction text before any points have been added
svg.append("text")
    .attr("id", "instructions")
    .attr("x", "50%")
    .attr("y", "50%")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-size", "5em")
    .attr("fill", "lightgrey")
    .attr("style", "user-select: none")
    .text("Double-Click to add points!");

let _history = new undo_history();
let pp = new polypath();
_history.push(pp);



svg.on("dblclick", (e) => {
    // check if event origin was circle with id "start"
    let was_start = e.target.id == "start";
    _history.log_state(extensive = true);
    if (!was_start) {
        if (pp.subpaths.length > 0 && !pp.subpaths[pp.subpaths.length - 1].closed) {
            pp.subpaths[pp.subpaths.length - 1].add_point(get_event_svg_coords(e));
        } else {
            svg.select("#instructions").remove();
            pp.add_path(new path(pp, pp.subpaths.length));
            pp.subpaths[pp.subpaths.length - 1].add_point(get_event_svg_coords(e));
        }
    }
    _history.push(pp);
});

let d3_body = d3.select("body");


d3.select("#undo_button").on("click", undo);
d3.select("#redo_button").on("click", redo);


let alt_pressed = false;

d3_body.on("keydown", (e) => {
    if (String.fromCharCode(e.which) == " ") {
        for (let subpath of pp.subpaths) {
            subpath.ui.attr("opacity", 0);
            pp.p.attr("fill", "black");
        }
    } else if (e.altKey) {
        e.preventDefault();
        alt_pressed = true;
    }
});

d3_body.on("keyup", (e) => {
    if (String.fromCharCode(e.which) == " ") {
        for (let subpath of pp.subpaths) {
            subpath.ui.attr("opacity", 1);
            pp.p.attr("fill", "rgba(0, 0, 0, 0.125)");
        }
    } else if (e.altKey) {
        alt_pressed = false;
    }
});

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    if (!svg.select(":focus").empty()) {
        let el = svg.select(":focus");
        let spline_nr = parseInt(el.attr("spline_nr"));
        let subpath_nr = parseInt(el.attr("subpath_nr"));
        let subpath = pp.subpaths[subpath_nr];
        let bezier = subpath.splines[spline_nr];
        if (el.attr("id") == "start") {
            d3.select("#node_type").attr("style", "display: block");
            d3.select("#lock").attr("style", "display: none");

            d3.select("#corner_radio").property("checked", bezier.start_point_type == point.point_types.corner);
            d3.select("#smooth_radio").property("checked", bezier.start_point_type == point.point_types.smooth);
        } else if (el.attr("id") == "end") {
            d3.select("#node_type").attr("style", "display: block");
            d3.select("#lock").attr("style", "display: none");

            d3.select("#corner_radio").property("checked", bezier.end_point_type == point.point_types.corner);
            d3.select("#smooth_radio").property("checked", bezier.end_point_type == point.point_types.smooth);

            d3.select("[name='curve_type']");
        }
        else if (el.attr("id") == "C1") {
            d3.select("#lock").attr("style", "display: block");
            if (bezier.is_start_hv_locked) {
                d3.select("#hv-lock").attr("style", "font-weight: bold");
            } else {
                d3.select("#hv-lock").attr("style", "font-weight: normal");
            }
            d3.select("#hv-lock_checkbox").property("checked", bezier.is_start_hv_locked);
            d3.select("#node_type").attr("style", "display: none");
        } else if (el.attr("id") == "C2") {
            d3.select("#lock").attr("style", "display: block");
            if (bezier.is_end_hv_locked) {
                d3.select("#hv-lock").attr("style", "font-weight: bold");
            } else {
                d3.select("#hv-lock").attr("style", "font-weight: normal");
            }
            d3.select("#hv-lock_checkbox").property("checked", bezier.is_end_hv_locked);
            d3.select("#node_type").attr("style", "display: none");
        }

        var tooltip = document.getElementById('tooltip');
        tooltip.className = 'visible';
        tooltip.style.left = event.pageX + 20 + 'px';
        tooltip.style.top = event.pageY - 20 + 'px';
    }
});

let contextmenu = d3.select("#tooltip");

contextmenu.on("mousedown", (e) => {
    e.preventDefault();
});

contextmenu.selectAll('[name="curve_type"]').on("change", (e) => {
    e.preventDefault();
    if (!svg.select(":focus").empty()) {
        let el = svg.select(":focus");
        let spline_nr = parseInt(el.attr("spline_nr"));
        let subpath_nr = parseInt(el.attr("subpath_nr"));
        let subpath = pp.subpaths[subpath_nr];
        let bezier = subpath.splines[spline_nr];
        if (el.attr("id") == "start") {
            bezier.start_point_type = parseInt(e.target.value);
        } else if (el.attr("id") == "end") {
            bezier.end_point_type = parseInt(e.target.value);
            console.log(e.target.value);
        }
        // subpath.update_path(true, spline_nr);
    }
});

contextmenu.select("#corner").on("mousedown", (e) => {
    e.preventDefault();
    if (!svg.select(":focus").empty()) {
        console.log("corner");
        set_point_type(point.point_types.corner);
    }
});

contextmenu.select("#smooth").on("mousedown", (e) => {
    e.preventDefault();
    if (!svg.select(":focus").empty()) {
        console.log("smooth");
        set_point_type(point.point_types.smooth);
    }
});

contextmenu.select("#hv-lock").on("mousedown", (e) => {
    e.preventDefault();
    if (!svg.select(":focus").empty()) {
        let el = svg.select(":focus");
        let spline_nr = parseInt(el.attr("spline_nr"));
        let subpath_nr = parseInt(el.attr("subpath_nr"));
        let subpath = pp.subpaths[subpath_nr];
        let bezier = subpath.splines[spline_nr];
        if (el.attr("id") == "start" || el.attr("id") == "C1") {
            console.log("start");
            bezier.is_start_hv_locked = !bezier.is_start_hv_locked;
        } else if (el.attr("id") == "end" || el.attr("id") == "C2") {
            console.log("end");
            bezier.is_end_hv_locked = !bezier.is_end_hv_locked;
        }
        subpath.update_path(true, spline_nr);
    }
});


document.addEventListener('click', (event) => {
    const isTooltip = event.target === tooltip || tooltip.contains(event.target);
    if (!isTooltip) {
        tooltip.className = '';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key == "z") {
        undo();
    }
    if (e.ctrlKey && e.key == "y") {
        redo();
    }
})


function undo() {
    pp = _history.step_back(pp);
    // _history.log_state(true);
    // clear svg
    pp.redraw_polypath();
}

function redo() {
    console.log("redo")
    pp = _history.step_forward(pp);
    pp.redraw_polypath();
    // _history.log_state(true);
}


function set_point_type(type) {
    let el = svg.select(":focus");

    let subpath_nr = parseInt(el.attr("subpath_nr"));
    let subpath = pp.subpaths[subpath_nr];

    let spline_nr = parseInt(el.attr("spline_nr"));
    let bezier = subpath.splines[spline_nr];

    if (el.attr("id") == "start") {
        bezier.start_point_type = type;
        if (subpath.closed) {
            next_bezier = subpath.splines[subpath.splines.length - 1];
            next_bezier.end_point_type = type;
        }
    } else if (el.attr("id") == "end") {
        bezier.end_point_type = type;
        if (spline_nr < subpath.splines.length - 1) {
            next_bezier = subpath.splines[spline_nr + 1];
            next_bezier.start_point_type = type;
        }
    }
}

