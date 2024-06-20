class path {
    /**
     * Constructs a new cubic bezier spline from 4 points
     * @param {polypath} set_parent parent polypath
     */
    constructor(set_parent, set_index, append = true) {
        this.parent = set_parent;
        this.index = set_index;


        this.has_ui = false;
        this.closed = false;
        this.start;

        this.splines = [];


        this.is_ui_els = [];
        this.tunni_lines = [];
        this.C1_lines = [];
        this.C1_ui_els = [];
        this.C2_lines = [];
        this.C2_ui_els = [];
        this.start_ui_el;
        this.end_ui_els = [];
        this.tunni_ui_els = [];

        if (append) {
            this.ui = svg.append("g").attr("id", "ui");
            this.is_group = this.ui.append("g").attr("id", "is");
            this.tunni_line_group = this.ui.append("g").attr("id", "tunni_line");
            this.C1_line_group = this.ui.append("g").attr("id", "C1_lines");
            this.C1_group = this.ui.append("g").attr("id", "C1");
            this.C2_line_group = this.ui.append("g").attr("id", "C2_lines");
            this.C2_group = this.ui.append("g").attr("id", "C2");
            this.start_group = this.ui.append("g").attr("id", "start");
            this.end_group = this.ui.append("g").attr("id", "end");
            this.tunni_group = this.ui.append("g").attr("id", "tunni");
        } else {
            this.ui = d3.select("#ui");
            this.is_group = d3.select("#is");
            this.tunni_line_group = d3.select("#tunni_line");
            this.C1_line_group = d3.select("#C1_lines");
            this.C1_group = d3.select("#C1");
            this.C2_line_group = d3.select("#C2_lines");
            this.C2_group = d3.select("#C2");
            this.start_group = d3.select("#start");
            this.end_group = d3.select("#end");
            this.tunni_group = d3.select("#tunni");
        }
        // this.update_path(true, 0);
    }


    close_path = () => {
        this.closed = true;
    }

    add_ui(redraw=false) {
        this.add_start_ui();
        for (let i = 0; i < this.splines.length; i++) {
            this.add_ui_control(i, redraw);
        }
        this.has_ui = true;
    }



    /**
     * Add ui control points for a given spline
     * @param {Number} i spline number
     */
    add_ui_control(i, redraw=false) {
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
            .attr("id", "C1-line")
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
            .attr("id", "C2-line")
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

        if (!this.closed || redraw) {
            this.end_ui_els.push(this.end_group.append("circle")
                .attr("cx", curr.end.x + "px")
                .attr("cy", curr.end.y + "px")
                .attr("spline_nr", i)
                .attr("subpath_nr", this.index)
                .attr("fill", "steelblue")
                .attr("r", "5px")
                .attr("id", "end")
                .attr("tabindex", "0").on("dblclick", (e) => {
                    // stop event propagation -> new point cannot be created on top of an existing
                    // point
                    e.cancelBubble = true;
                }));
        } else {
            console.log("Path was closed")
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
            this.add_point(this.start);
        })
    }

    /**
     * Updates the displayed path of a given spline
     * @param {boolean} update_tunni whether the tunni point should be updated
     * @param {number} i number of the spline
     * @param {number} j number of secondary spline to update (because of smooth enabled splines)
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
        let is = geometry.intersection(bezier.start, bezier.C1, bezier.C2, bezier.end);
        let next_is;
        if (i + 1 < this.splines.length) {
            next_bezier = this.splines[i + 1];
            next_is = geometry.intersection(next_bezier.start, next_bezier.C1, next_bezier.C2, next_bezier.end);
        }

        if (geometry.same_side(bezier.start, bezier.end, bezier.C1, bezier.C2)) {
            if (geometry.same_side(bezier.start, bezier.end, bezier.C1, is)) {
                this.is_ui_els[i]
                    .attr("style", "display: inline");
                this.upd_SVG_circle(this.is_ui_els[i], is);
                if (i + 1 < this.splines.length) {
                    this.is_ui_els[i + 1]
                        .attr("style", "display: inline");
                    this.upd_SVG_circle(this.is_ui_els[i + 1], next_is);
                }
                if (update_tunni) {
                    let tunni = geometry.tunni_location(bezier, is);
                    this.upd_SVG_circle(this.tunni_ui_els[i], tunni);
                    if (i + 1 < this.splines.length) {
                        let next_tunni = geometry.tunni_location(next_bezier, next_is);
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

        if (geometry.distance_line_to_point(bezier.start, bezier.end, bezier.C1) < 7
            && geometry.distance_line_to_point(bezier.start, bezier.end, bezier.C2) < 7) {
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
        let is = geometry.intersection(bezier.start, bezier.C1, bezier.C2, bezier.end);
        let C1_scale = point.length(bezier.C1, bezier.start) / point.length(is, bezier.start);
        let C2_scale = point.length(bezier.C2, bezier.end) / point.length(is, bezier.end);

        let avg = (C1_scale + C2_scale) / 2;
        console.log(avg);
        // when both start and end points have same coordinates, avg is NaN
        // the programm behaves insensibly in this case.
        if (avg !== avg && avg !== Infinity && avg !== -Infinity) {
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

    /**
     * creates a clone of the path
     * @returns {path} clone
     */
    clone(parent = this.parent) {
        let clone = new path(parent, this.index, false);
        clone.start = this.start.clone();
        clone.splines = [];
        for (let spline of this.splines) {
            clone.splines.push(spline.clone());
        }
        clone.closed = this.closed;
        return clone;
    }

    clear_ui() {
        svg.selectAll("svg > path").attr("d", "");
        svg.selectAll("svg > #ui > g > *").remove();
        this.start_ui_el = undefined;
        this.end_ui_els = [];
        this.tunni_ui_els = [];
        this.is_ui_els = [];
        this.tunni_lines = [];
        this.C1_lines = [];
        this.C1_ui_els = [];
        this.C2_lines = [];
        this.C2_ui_els = [];
        this.tunni_ui_els = [];
    }
}