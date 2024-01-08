//================================================================================================//
// full screen
//================================================================================================//

let svg = d3.select("svg");

svg.attr("width", "100%")
    .attr("height", "calc(100% - 54px)");
// 100% - footer-height
// somewhere there are 4 px lost miraculously

sel_el = false;

//================================================================================================//
// class representing a SVG path element with ui-controls.
//================================================================================================//


class path {
    /**
     * Constructs a new cubic bezier spline from 4 points
     * @param {polypath} set_parent parent polypath
     */
    constructor(set_parent, set_index) {
        this.closed = false;
        this.parent = set_parent;
        this.index = set_index;
        /**
         * @type{bezier[]}
         */
        this.splines = [];

        this.is_ui_els = [];
        this.ui = svg.append("g").attr("id", "ui");
        this.is_group = this.ui.append("g").attr("id", "is");

        this.tunni_lines = [];
        this.tunni_line_group = this.ui.append("g").attr("id", "tunni_line");

        this.C1_lines = [];
        this.C1_line_group = this.ui.append("g").attr("id", "C1_lines");

        this.C1_ui_els = [];
        this.C1_group = this.ui.append("g").attr("id", "C1");

        this.C2_lines = [];
        this.C2_line_group = this.ui.append("g").attr("id", "C2_lines");

        this.C2_ui_els = [];
        this.C2_group = this.ui.append("g").attr("id", "C2");

        this.start;
        this.start_ui_el;
        this.start_group = this.ui.append("g").attr("id", "start");

        this.end_ui_els = [];
        this.end_group = this.ui.append("g").attr("id", "end");

        this.tunni_ui_els = [];
        this.tunni_group = this.ui.append("g").attr("id", "tunni");

        for (let i = 0; i < this.splines.length; i++) {
            this.add_ui_control(i);
        }
        // this.update_path(true, 0);
    }


    close_path = () => {
        this.closed = true;
    }

    /**
     * Add ui control points for a given spline
     * @param {Number} i spline number
     */
    add_ui_control(i) {
        let curr = this.splines[i];
        this.is_ui_els.push(this.is_group.append("circle")
            .attr("cx", curr.is_point.x + "px")
            .attr("cy", curr.is_point.y + "px")
            .attr("id", "is")
            .attr("spline_nr", i)
            .attr("subpath_nr", this.index)
            .attr("opacity", 0));

        this.tunni_lines.push(this.tunni_line_group.append("line")
            .attr("x1", curr.C1.x)
            .attr("y1", curr.C1.y)
            .attr("x2", curr.C2.x)
            .attr("y2", curr.C2.y)
            .attr("spline_nr", i)
            .attr("subpath_nr", this.index)
            .attr("stroke", "steelblue")
            .attr("stroke-width", "3px")
            .attr("opacity", "0.5")
            .attr("id", "tunni-line"));

        // control point 1
        this.C1_lines.push(this.C1_line_group.append("line")
            .attr("x1", curr.start.x)
            .attr("y1", curr.start.y)
            .attr("x2", curr.C1.x)
            .attr("y2", curr.C1.y)
            .attr("spline_nr", i)
            .attr("subpath_nr", this.index)
            .attr("stroke-width", "1px"));

        this.C1_ui_els.push(this.C1_group.append("circle")
            .attr("cx", curr.C1.x + "px")
            .attr("cy", curr.C1.y + "px")
            .attr("spline_nr", i)
            .attr("subpath_nr", this.index)
            .attr("fill", "lightsteelblue")
            .attr("r", "5px")
            .attr("id", "C1")
            .attr("tabindex", "0"));

        this.C2_lines.push(this.C2_line_group.append("line")
            .attr("x1", curr.end.x)
            .attr("y1", curr.end.y)
            .attr("x2", curr.C2.x)
            .attr("y2", curr.C2.y)
            .attr("spline_nr", i)
            .attr("subpath_nr", this.index)
            .attr("stroke-width", "1px")
            .attr("stroke", "black"));

        this.C2_ui_els.push(this.C2_group.append("circle")
            .attr("cx", curr.C2.x + "px")
            .attr("cy", curr.C2.y + "px")
            .attr("spline_nr", i)
            .attr("subpath_nr", this.index)
            .attr("fill", "lightsteelblue")
            .attr("r", "5px")
            .attr("id", "C2")
            .attr("tabindex", "0"));

        if (!this.closed) {
            this.end_ui_els.push(this.end_group.append("circle")
                .attr("cx", curr.end.x + "px")
                .attr("cy", curr.end.y + "px")
                .attr("spline_nr", i)
                .attr("subpath_nr", this.index)
                .attr("fill", "steelblue")
                .attr("r", "5px")
                .attr("id", "end")
                .attr("tabindex", "0"));
        }
        // tunni point
        this.tunni_ui_els.push(this.tunni_group.append("circle")
            .attr("cx", curr.tunni_point.x + "px")
            .attr("cy", curr.tunni_point.y + "px")
            .attr("spline_nr", i)
            .attr("subpath_nr", this.index)
            .attr("fill", "steelblue")
            .attr("r", "5px")
            .attr("id", "tunni")
            .attr("style", "display: none")
            .on("dblclick", (e) => {
                this.balance(i);
                // stop event propagation
                e.cancelBubble = true;
            }));

        if (!this.closed) {
            make_draggable(this.end_ui_els[i]);
        }
        make_draggable(this.C1_ui_els[i]);
        make_draggable(this.C2_ui_els[i]);
        make_draggable(this.tunni_ui_els[i]);
        make_draggable(this.tunni_lines[i]);
    }

    add_start_ui() {
        this.start_ui_el = this.start_group.append("circle")
            .attr("cx", this.start.x + "px")
            .attr("cy", this.start.y + "px")
            .attr("spline_nr", 0)
            .attr("subpath_nr", this.index)
            .attr("fill", "steelblue")
            .attr("r", "5px")
            .attr("id", "start")
            .attr("tabindex", "0");
        this.start_ui_el.on("dblclick", (e) => {
            e.cancelBubble = true;
            this.add_point(this.start);
        })

        make_draggable(this.start_ui_el);
    }

    /**
     * Updates the displayed path of a given spline
     * @param {boolean} update_tunni whether thhe tunni point should be updated
     * @param {number} i number of the spline
     */
    update_path(update_tunni, i, j = i) {
        if (this.splines.length == 0) {
            return;
        }
        if (j != i) {
            this.update_path(update_tunni, j);
        }
        this.parent.p.attr("d", this.parent.to_string());
        // update tunni point
        let bezier = this.splines[i];
        let next_bezier;
        let is = this.intersection(bezier.start, bezier.C1, bezier.C2, bezier.end);
        let next_is;
        if (i + 1 < this.splines.length) {
            next_bezier = this.splines[i + 1];
            next_is = this.intersection(next_bezier.start, next_bezier.C1, next_bezier.C2, next_bezier.end);
        }

        if (this.same_side(bezier.start, bezier.end, bezier.C1, bezier.C2)) {
            if (this.same_side(bezier.start, bezier.end, bezier.C1, is)) {
                this.is_ui_els[i]
                    .attr("style", "display: inline");
                this.upd_SVG_circle(this.is_ui_els[i], is);
                if (i + 1 < this.splines.length) {
                    this.is_ui_els[i + 1]
                        .attr("style", "display: inline");
                    this.upd_SVG_circle(this.is_ui_els[i + 1], next_is);
                }
                if (update_tunni) {
                    let tunni = this.tunni_location(bezier, is);
                    this.upd_SVG_circle(this.tunni_ui_els[i], tunni);
                    if (i + 1 < this.splines.length) {
                        let next_tunni = this.tunni_location(next_bezier, next_is);
                        this.upd_SVG_circle(this.tunni_ui_els[i + 1], next_tunni);
                    }
                }
                this.tunni_ui_els[i].attr("style", "display: inline");
            } else {
                this.tunni_ui_els[i].attr("style", "display: none");
                if (sel_el.attr("id") == "tunni") {
                    end_drag_node();
                }
            }
        } else {
            this.tunni_ui_els[i].attr("style", "display: none");
            if (sel_el && sel_el.attr("id") == "tunni") {
                end_drag_node();
            }
        }

        if (this.distance_line_to_point(bezier.start, bezier.end, bezier.C1) < 7
            && this.distance_line_to_point(bezier.start, bezier.end, bezier.C2) < 7) {
            this.tunni_lines[i].attr("style", "display: none");
        } else {
            this.tunni_lines[i].attr("style", "display: inline");
        }
    }

    /**
     * Adds a bezier to the point from the endpoint of the last spline. If the new point is equal to
     * the start point (point to same object) the path is closed.
     * @param {point} p new endpoint
     */
    add_point = (p) => {
        if (this.start != undefined) {
            let start_p;
            if (this.splines.length >= 1) {
                start_p = this.splines[this.splines.length - 1].end;
            } else {
                start_p = this.start;
            }
            let c1 = new point(start_p.x + 0.33 * (p.x - start_p.x), start_p.y + 0.33 * (p.y - start_p.y));
            let c2 = new point(start_p.x + 0.67 * (p.x - start_p.x), start_p.y + 0.67 * (p.y - start_p.y));
            this.splines.push(new bezier(start_p, c1, c2, p));
            if (p == this.start) {
                this.close_path();
            }
            this.add_ui_control(this.splines.length - 1);
            this.update_path(true, this.splines.length - 1);
        } else {
            this.start = p;
            this.add_start_ui();
        }
    }

    /**
     *
     * @returns string representing the spline
     */
    spline_string = () => {
        if (this.splines.length == 0) {
            return "";
        }
        let str = this.splines[0].to_string();
        for (let i = 1; i < this.splines.length; i++) {
            str += " " + this.splines[i].suffix_string();
        }
        if (this.closed) {
            str += " Z";
        }
        return str;
    }

    balance = (i) => {
        let bezier = this.splines[i];
        let is = this.intersection(bezier.start, bezier.C1, bezier.C2, bezier.end);
        let C1_scale = point.length(bezier.C1, bezier.start) / point.length(is, bezier.start);
        let C2_scale = point.length(bezier.C2, bezier.end) / point.length(is, bezier.end);

        let avg = (C1_scale + C2_scale) / 2;
        console.log(avg);
        // when both start and end points have same coordinates, avg is NaN
        // the programm behaves insensibly in this case.
        if (avg !== avg) {
            return;
        }
        bezier.C1 = point.add(bezier.start, point.mult(point.sub(is, bezier.start), avg));
        bezier.C2 = point.add(bezier.end, point.mult(point.sub(is, bezier.end), avg));

        this.upd_SVG_circle(this.C1_ui_els[i], bezier.C1);
        this.upd_SVG_line(this.C1_lines[i], bezier.start, bezier.C1);
        this.upd_SVG_circle(this.C2_ui_els[i], bezier.C2);
        this.upd_SVG_line(this.C2_lines[i], bezier.end, bezier.C2);
        this.upd_SVG_line(this.tunni_lines[i], bezier.C1, bezier.C2);
        this.update_path(true, i);
    }




    //============================================================================================//
    // getters and setters
    //============================================================================================//

    /**
     * Updates the coordinates of an SVG-line
     * @param {Object} l the line
     * @param {point} p1 the first point
     * @param {point} p2 the second point
     */
    upd_SVG_line = (l, p1, p2) => {
        l
            .attr("x1", p1.x)
            .attr("y1", p1.y)
            .attr("x2", p2.x)
            .attr("y2", p2.y);
    }

    /**
     * Updates the coordinates of an SVG-circle
     * @param {Object} c the circle
     * @param {point} p point to update to
     */
    upd_SVG_circle = (c, p) => {
        c
            .attr("cx", p.x)
            .attr("cy", p.y);
    }

    //============================================================================================//
    // geometry functions
    //============================================================================================//


    /**
     * Returns whether point c is left of the line a-b;
     * @param {point} a first point of line
     * @param {point} b second point of line
     * @param {point} c point to check
     * @returns {number} -1 if c is left, 1 if c is right, 0 if c is on the line
     */
    is_left(a, b, c) {
        return Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    }
    /**
     * Returns whether last two arguments lie on the same side of first two
     * @param {point} a first point of line
     * @param {point} b second point of line
     * @param {point} c first point
     * @param {point} d second point
     * @returns {boolean} true if c and d are on the same side of a-b
     */
    same_side(a, b, c, d) {
        return this.is_left(a, b, c) == this.is_left(a, b, d);
    }

    /**
     * Returns the intersection point of two lines defined by two points each
     * @param {point} a first point of first line
     * @param {point} b second point of first line
     * @param {point} c first point of second line
     * @param {point} d second point of second line
     * @returns {point} intersection point
     */
    intersection(a, b, c, d) {
        let denominator = ((d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y))
        if (denominator == 0) {
            return new point(d.x, d.y);
        }
        let scale_x = ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / denominator;
        let x_coord = a.x + scale_x * (b.x - a.x);
        let y_coord = a.y + scale_x * (b.y - a.y);
        return new point(x_coord, y_coord);
    }

    /**
     * Computes the location of the tunni point
     *
     * @param {bezier} s
     * @param {point} is intersection of the control point vectors
     * @returns {point} location of the tunni point
     */
    tunni_location(bezier, is) {
        return point.sub(point.add(point.sub(point.mult(bezier.C1, 2), bezier.start),
            point.sub(point.mult(bezier.C2, 2), bezier.end)), is);
    }

    /**
     * Returns the angle between 2d lines p1-p2 and p3-p4
     * @param {point} p1 first point of first line
     * @param {point} p2 second point of first line
     * @param {point} p3 first point of second line
     * @param {point} p4 second point of second line
     * @returns
     */
    angle_between = (p1, p2, p3, p4) => {
        let v1 = point.sub(p2, p1);
        let v2 = point.sub(p4, p3);
        let dot = v1.x * v2.x + v1.y * v2.y;
        let det = v1.x * v2.y - v1.y * v2.x;
        return Math.atan2(det, dot);
    }

    /**
     * Returns the distance between a line and a point
     * @param {point} p1 first point of line
     * @param {point} p2 second point of line
     * @param {point} p3 point
     * @returns {number} distance
     */
    distance_line_to_point = (p1, p2, p3) => {
        let v1 = point.sub(p2, p1);
        let v2 = point.sub(p3, p1);
        let det = v1.x * v2.y - v1.y * v2.x;
        return Math.abs(det) / Math.sqrt(v1.x ** 2 + v1.y ** 2);
    }
}


//================================================================================================//
//
// logic for dragging ui elements
//
//================================================================================================//

make_draggable = (ui_el) => {
    ui_el.on("mousedown", start_drag);
    // only need to do this once maybe #TODO
    svg.on("mousemove", drag);
    svg.on("mouseup", end_drag);
}

start_drag = (e) => {
    sel_el = d3.select(e.currentTarget);
    if (sel_el.node().tagName == "circle") {
        start_drag_node(e);
    }
    else if (sel_el.node().tagName == "line") {
        start_drag_line(e);
    }
}

drag = (e) => {
    if (sel_el) {
        if (sel_el.node().tagName == "circle") {
            drag_node(e);
        }
        else if (sel_el.node().tagName == "line") {
            drag_line(e);
        }
    }
}

end_drag = (e) => {
    if (sel_el) {
        if (sel_el.node().tagName == "circle") {
            end_drag_node(e);
        }
        else if (sel_el.node().tagName == "line") {
            end_drag_line(e);
        }
    }
}

start_drag_node = (e) => {
    if (sel_el && sel_el.node().tagName == "circle") {
        sel_el.attr("r", "10px")
    }
}

/**
 * Drags a node and updates all relevant control points
 * @param {MouseEvent} e the event
 */
drag_node = (e) => {
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
        let e_point = new point(e.x, e.y);

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
            if (bezier.start_point_type == point_types.smooth) {
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
            if (bezier.end_point_type == point_types.smooth) {
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
                let C1_intersection = subpath.intersection(C1_halfway_point, C2_vector,
                    bezier.start, bezier.C1);

                bezier.C1 = C1_intersection;

                subpath.upd_SVG_circle(C1_ui_el, bezier.C1);
                subpath.upd_SVG_line(C1_line, bezier.start, bezier.C1);

                let C2_halfway_point = point.div(point.add(bezier.tunni_point, bezier.end), 2)
                let C1_vector = point.add(point.sub(bezier.C1, bezier.start), C2_halfway_point);
                let C2_intersection = subpath.intersection(C2_halfway_point,
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

    /**
     * Starts dragging the tunni line
     * @param {MouseEvent} e the mouse event
     */
    start_drag_line = (e) => {
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
    drag_line = (e) => {
        let e_point = new point(e.x, e.y);
        if (sel_el && sel_el.node().tagName == "line") {
            let i = parseInt(sel_el.attr("spline_nr"));
            let sp_nr = parseInt(sel_el.attr("subpath_nr"));
            let subpath = pp.subpaths[sp_nr];
            let bezier = subpath.splines[i];
            let tl_vector = point.sub(point.add(e_point, bezier.C2), bezier.C1);
            bezier.C1 = subpath.intersection(e, tl_vector, bezier.start, bezier.C1);
            bezier.C2 = subpath.intersection(e, tl_vector, bezier.end, bezier.C2);
            subpath.upd_SVG_circle(subpath.C1_ui_els[i], bezier.C1);
            subpath.upd_SVG_line(subpath.C1_lines[i], bezier.start, bezier.C1);
            subpath.upd_SVG_circle(subpath.C2_ui_els[i], bezier.C2);
            subpath.upd_SVG_line(subpath.C2_lines[i], bezier.end, bezier.C2);
            subpath.upd_SVG_line(subpath.tunni_lines[i], bezier.C1, bezier.C2);
            subpath.update_path(true, i);
        }
    }

    /**
     * Ends the dragging of the Tunni Lines and resets the state of the system
     * @param {MouseEvent} e mouseup-event
     */
    end_drag_line = (e) => {
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


    let pp = new polypath();
    svg.on("dblclick", (e) => {
        if (pp.subpaths.length > 0 && !pp.subpaths[pp.subpaths.length - 1].closed) {
            pp.subpaths[pp.subpaths.length - 1].add_point(new point(e.x, e.y));
        } else {
            svg.select("#instructions").remove();
            pp.add_path(new path(pp, pp.subpaths.length));
            pp.subpaths[pp.subpaths.length - 1].add_point(new point(e.x, e.y));
        }
    });

    let d3_body = d3.select("body");

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

                d3.select("#corner_radio").property("checked", bezier.start_point_type == point_types.corner);
                d3.select("#smooth_radio").property("checked", bezier.start_point_type == point_types.smooth);
            } else if (el.attr("id") == "end") {
                d3.select("#node_type").attr("style", "display: block");
                d3.select("#lock").attr("style", "display: none");

                d3.select("#corner_radio").property("checked", bezier.end_point_type == point_types.corner);
                d3.select("#smooth_radio").property("checked", bezier.end_point_type == point_types.smooth);

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
                if (bezier.is_start_hv_locked) {
                    d3.select("#hv-lock").attr("style", "font-weight: bold");
                } else {
                    d3.select("#hv-lock").attr("style", "font-weight: normal");
                }
                d3.select("#hv-lock_checkbox").property("checked", bezier.is_start_hv_locked);
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
            set_point_type(point_types.corner);
        }
    });

    contextmenu.select("#smooth").on("mousedown", (e) => {
        e.preventDefault();
        if (!svg.select(":focus").empty()) {
            console.log("smooth");
            set_point_type(point_types.smooth);
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

