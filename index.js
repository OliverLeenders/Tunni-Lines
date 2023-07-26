//================================================================================================//
// full screen
//================================================================================================//

let svg = d3.select("svg");

svg.attr("width", "100%")
    .attr("height", "calc(100% - 40px)");

sel_el = false;

//================================================================================================//
// defining main classes
//================================================================================================//

class point {
    /**
     * Constructs a new point
     * @param {number} x x-Coordinate
     * @param {number} y y-Coordinate
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Add two points / vectors
     * @param {point} p1 first point
     * @param {point} p2 second point
     */
    static add = (p1, p2) => {
        return new point(p1.x + p2.x, p1.y + p2.y);
    }

    /**
     * Subtract two points / vectors
     * @param {point} p1 
     * @param {point} p2 
     */
    static sub = (p1, p2) => {
        return new point(p1.x - p2.x, p1.y - p2.y);
    }

    /**
     * Multiplies a point / vector with a number
     * @param {point} p 
     * @param {number} c 
     * @returns 
     */
    static mult = (p, c) => {
        return new point(p.x * c, p.y * c);
    }

    /**
     * Divide coordinates of point by number
     * @param {point} p 
     * @param {Number} c 
     */
    static div = (p, c) => {
        if (c == 0) {
            console.error("Division by zero!")
            return p;
        }
        return new point(p.x / c, p.y / c)
    }

    static length = (p1, p2) => {
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }

    to_string() {
        return this.x + " " + this.y;
    }
}

//================================================================================================//
// class representing cubic bezier.
//================================================================================================//

class bezier {
    /**
     * Constructs a new cubic bezier spline from 4 points
     * @param {point} start start-point
     * @param {point} C1 control point one
     * @param {point} C2 control point two
     * @param {point} end end-point
     */
    constructor(start, C1, C2, end) {
        this.start = start;
        this.C1 = C1;
        this.C2 = C2;
        this.end = end;
        this.is_point = new point(0, 0);
        this.tunni_point = new point(0, 0);
    }

    to_string() {
        return "M " // move to
            + this.start.to_string()
            + " C " // curve to
            + this.C1.to_string() + ", "
            + this.C2.to_string() + ", "
            + this.end.to_string();
    }

    suffix_string() {
        return " C " // curve to
            + this.C1.to_string() + ", "
            + this.C2.to_string() + ", "
            + this.end.to_string();
    }
}

class path {
    /**
     * Constructs a new cubic bezier spline from 4 points
     * @param {point} start start-posint
     * @param {point} C1 control point one
     * @param {point} C2 control point two
     * @param {point} end end-point
     */
    constructor(start, C1, C2, end) {
        this.splines = [];
        this.splines.push(new bezier(start, C1, C2, end));
        this.p = svg.append("path")
            .attr("stroke", "black")
            .attr("fill", "transparent");

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

        this.start_ui_els = [];
        this.start_group = this.ui.append("g").attr("id", "start");

        this.end_ui_els = [];
        this.end_group = this.ui.append("g").attr("id", "end");

        this.tunni_ui_els = [];
        this.tunni_group = this.ui.append("g").attr("id", "tunni");

        for (let i = 0; i < this.splines.length; i++) {
            this.add_ui_control(i);
        }
        this.update_path(true, 0);
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
            .attr("fill", "gray")
            .attr("r", "3px")
            .attr("id", "is")
            .attr("spline_nr", i)
            .attr("opacity", 0));

        this.tunni_lines.push(this.tunni_line_group.append("line")
            .attr("x1", curr.C1.x)
            .attr("y1", curr.C1.y)
            .attr("x2", curr.C2.x)
            .attr("y2", curr.C2.y)
            .attr("spline_nr", i)
            .attr("stroke", "steelblue")
            .attr("stroke-width", "3px")
            .attr("id", "tunni-line"));

        // control point 1
        this.C1_lines.push(this.C1_line_group.append("line")
            .attr("x1", curr.start.x)
            .attr("y1", curr.start.y)
            .attr("x2", curr.C1.x)
            .attr("y2", curr.C1.y)
            .attr("spline_nr", i)
            .attr("stroke-width", "1px")
            .attr("stroke", "black"));

        this.C1_ui_els.push(this.C1_group.append("circle")
            .attr("cx", curr.C1.x + "px")
            .attr("cy", curr.C1.y + "px")
            .attr("spline_nr", i)
            .attr("fill", "lightsteelblue")
            .attr("r", "5px")
            .attr("id", "C1"));

        this.C2_lines.push(this.C2_line_group.append("line")
            .attr("x1", curr.end.x)
            .attr("y1", curr.end.y)
            .attr("x2", curr.C2.x)
            .attr("y2", curr.C2.y)
            .attr("spline_nr", i)
            .attr("stroke-width", "1px")
            .attr("stroke", "black"));

        this.C2_ui_els.push(this.C2_group.append("circle")
            .attr("cx", curr.C2.x + "px")
            .attr("cy", curr.C2.y + "px")
            .attr("spline_nr", i)
            .attr("fill", "lightsteelblue")
            .attr("r", "5px")
            .attr("id", "C2"));

        // the start node should only be drawn for the first path and is the end node of the
        // previous path in all other cases
        if (i == 0) {
            this.start_ui_els.push(this.start_group.append("circle")
                .attr("cx", curr.start.x + "px")
                .attr("cy", curr.start.y + "px")
                .attr("spline_nr", i)
                .attr("fill", "steelblue")
                .attr("r", "5px")
                .attr("id", "start"));
        }
        this.end_ui_els.push(this.end_group.append("circle")
            .attr("cx", curr.end.x + "px")
            .attr("cy", curr.end.y + "px")
            .attr("spline_nr", i)
            .attr("fill", "steelblue")
            .attr("r", "5px")
            .attr("id", "end"));

        // tunni point
        this.tunni_ui_els.push(this.tunni_group.append("circle")
            .attr("cx", curr.tunni_point.x + "px")
            .attr("cy", curr.tunni_point.y + "px")
            .attr("spline_nr", i)
            .attr("fill", "steelblue")
            .attr("r", "5px")
            .attr("id", "tunni")
            .attr("opacity", 0)
            .on("dblclick", (e) => {
                this.balance(i);
                // stop event propagation
                e.cancelBubble = true;
            }));

        this.make_draggable(this.start_ui_els[0]);
        this.make_draggable(this.end_ui_els[i]);
        this.make_draggable(this.C1_ui_els[i]);
        this.make_draggable(this.C2_ui_els[i]);
        this.make_draggable(this.tunni_ui_els[i]);

        this.make_draggable(this.tunni_lines[i]);
    }

    /**
     * Updates the displayed path of a given spline
     * @param {boolean} update_tunni whether thhe tunni point should be updated
     * @param {number} i number of the spline
     */
    update_path(update_tunni, i) {
        this.p.attr("d", this.spline_string());
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
                    .attr("opacity", 1);
                this.upd_SVG_circle(this.is_ui_els[i], is);
                if (i + 1 < this.splines.length) {
                    this.is_ui_els[i + 1]
                        .attr("opacity", 1);
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
                this.tunni_ui_els[i].attr("opacity", 1);
            } else {
                this.tunni_ui_els[i].attr("opacity", 0);
                if (sel_el.attr("id") == "tunni") {
                    this.end_drag_node();
                }
            }
        } else {
            this.tunni_ui_els[i].attr("opacity", 0);
            if (sel_el && sel_el.attr("id") == "tunni") {
                this.end_drag_node();
            }
        }
    }

    /**
     * Adds a bezier to the point from the endpoint of the last spline
     * @param {point} p new endpoint
     */
    add_spline = (p) => {
        let start = this.splines[this.splines.length - 1].end;
        let c1 = new point(start.x + 0.33 * (p.x - start.x), start.y + 0.33 * (p.y - start.y));
        let c2 = new point(start.x + 0.67 * (p.x - start.x), start.y + 0.67 * (p.y - start.y));
        this.splines.push(new bezier(start, c1, c2, p));
        this.add_ui_control(this.splines.length - 1);
        this.update_path(true, this.splines.length - 1);
    }

    /**
     *
     * @returns string representing the spline
     */
    spline_string = () => {
        let str = this.splines[0].to_string();
        for (let i = 1; i < this.splines.length; i++) {
            str += " " + this.splines[i].suffix_string();
        }
        return str;
    }

    balance = (i) => {
        let bezier = this.splines[i];
        let is = this.intersection(bezier.start, bezier.C1, bezier.C2, bezier.end);

        let C1_scale = point.length(bezier.C1, bezier.start) / point.length(is, bezier.start);
        let C2_scale = point.length(bezier.C2, bezier.end) / point.length(is, bezier.end);

        let avg = (C1_scale + C2_scale) / 2;

        bezier.C1 = point.add(bezier.start, point.mult(point.sub(is, bezier.start), avg));
        bezier.C2 = point.add(bezier.end, point.mult(point.sub(is, bezier.end), avg));

        this.upd_SVG_circle(this.C1_ui_els[i], bezier.C1);
        this.upd_SVG_line(this.C1_lines[i], bezier.start, bezier.C1);
        this.upd_SVG_circle(this.C2_ui_els[i], bezier.C2);
        this.upd_SVG_line(this.C2_lines[i], bezier.end, bezier.C2);
        this.upd_SVG_line(this.tunni_lines[i], bezier.C1, bezier.C2);
        this.update_path(true, i);
    }



    make_draggable(ui_el) {
        ui_el.on("mousedown", this.start_drag);
        svg.on("mousemove", this.drag);
        svg.on("mouseup", this.end_drag);
    }

    start_drag = (e) => {
        sel_el = d3.select(e.currentTarget);
        if (sel_el.node().tagName == "circle") {
            this.start_drag_node(e);
        }
        else if (sel_el.node().tagName == "line") {
            this.start_drag_line(e);
        }
    }

    drag = (e) => {
        if (sel_el) {
            if (sel_el.node().tagName == "circle") {
                this.drag_node(e);
            }
            else if (sel_el.node().tagName == "line") {
                this.drag_line(e);
            }
        }
    }

    end_drag = (e) => {
        if (sel_el) {
            if (sel_el.node().tagName == "circle") {
                this.end_drag_node(e);
            }
            else if (sel_el.node().tagName == "line") {
                this.end_drag_line(e);
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
            let upd_tunni = true;
            sel_el.attr("cx", e.x + "px");
            sel_el.attr("cy", e.y + "px");
            let i = parseInt(sel_el.attr("spline_nr"));
            let bezier = this.splines[i];
            let C1_line = this.C1_lines[i];
            let C2_line = this.C2_lines[i];
            let tunni_line = this.tunni_lines[i];
            let C1_ui_el = this.C1_ui_els[i];
            let C2_ui_el = this.C2_ui_els[i];
            let next_bezier = this.splines[i + 1];
            let e_point = new point(e.x, e.y);


            if (sel_el.attr("id") == "start") {
                let delta = point.sub(bezier.C1, bezier.start);
                bezier.start = e_point;
                bezier.C1 = point.add(bezier.start, delta);

                this.upd_SVG_line(C1_line, e_point, bezier.C1);
                this.upd_SVG_circle(C1_ui_el, bezier.C1);
                this.upd_SVG_line(tunni_line, bezier.C1, bezier.C2);
            } else if (sel_el.attr("id") == "end") {
                let delta = point.sub(bezier.C2, bezier.end);
                let next_delta;
                // if next_bezier is defined ...
                if (i < this.splines.length - 1) {
                    next_delta = point.sub(next_bezier.C1, bezier.end);
                }
                bezier.end = e_point;
                bezier.C2 = point.add(bezier.end, delta);
                if (i < this.splines.length - 1) {
                    next_bezier.start = e_point;
                    next_bezier.C1 = point.add(e_point, next_delta);

                    this.upd_SVG_line(this.C1_lines[i + 1], next_bezier.start, next_bezier.C1);
                    this.upd_SVG_circle(this.C1_ui_els[i + 1], next_bezier.C1);
                    this.upd_SVG_line(this.tunni_lines[i + 1], next_bezier.C1, next_bezier.C2);
                }

                this.upd_SVG_line(C2_line, e_point, bezier.C2);
                this.upd_SVG_circle(C2_ui_el, bezier.C2);
                this.upd_SVG_line(tunni_line, bezier.C1, bezier.C2);
            } else if (sel_el.attr("id") == "C1") {
                bezier.C1 = e_point;
                this.upd_SVG_line(C1_line, bezier.start, e_point);
                this.upd_SVG_line(tunni_line, e_point, bezier.C2);
            } else if (sel_el.attr("id") == "C2") {
                bezier.C2 = e_point;
                C2_line
                    .attr("x2", e_point.x)
                    .attr("y2", e_point.y);
                tunni_line
                    .attr("x2", e_point.x)
                    .attr("y2", e_point.y);
            } else if (sel_el.attr("id") == "tunni") {
                upd_tunni = false;
                bezier.tunni_point = e_point;

                let C1_halfway_point = point.div(point.add(bezier.tunni_point, bezier.start), 2)
                let C2_vector = point.add(point.sub(bezier.C2, bezier.end), C1_halfway_point);
                let C1_intersection = this.intersection(C1_halfway_point, C2_vector,
                    bezier.start, bezier.C1);

                bezier.C1 = C1_intersection;

                this.upd_SVG_circle(C1_ui_el, bezier.C1);
                this.upd_SVG_line(C1_line, bezier.start, bezier.C1);

                let C2_halfway_point = point.div(point.add(bezier.tunni_point, bezier.end), 2)
                let C1_vector = point.add(point.sub(bezier.C1, bezier.start), C2_halfway_point);
                let C2_intersection = this.intersection(C2_halfway_point,
                    C1_vector, bezier.end, bezier.C2);

                bezier.C2 = C2_intersection;

                this.upd_SVG_circle(C2_ui_el, bezier.C2);
                this.upd_SVG_line(C2_line, bezier.end, bezier.C2);
                this.upd_SVG_line(tunni_line, bezier.C1, bezier.C2);
            }
            this.update_path(upd_tunni, i);
        }
    }

    end_drag_node = (e) => {
        if (sel_el && sel_el.node().tagName == "circle") {
            sel_el.attr("r", "5px");
            sel_el = false;
        }
    }

    start_drag_line = (e) => {
        if (sel_el && sel_el.node().tagName == "line") {
            sel_el
                .attr("stroke-width", "5px");
        }
    }

    drag_line = (e) => {
        let e_point = new point(e.x, e.y);
        if (sel_el && sel_el.node().tagName == "line") {
            let i = parseInt(sel_el.attr("spline_nr"));
            let bezier = this.splines[i];
            let tl_vector = point.sub(point.add(e_point, bezier.C2), bezier.C1);
            bezier.C1 = this.intersection(e, tl_vector, bezier.start, bezier.C1);
            bezier.C2 = this.intersection(e, tl_vector, bezier.end, bezier.C2);
            this.upd_SVG_circle(this.C1_ui_els[i], bezier.C1);
            this.upd_SVG_line(this.C1_lines[i], bezier.start, bezier.C1);
            this.upd_SVG_circle(this.C2_ui_els[i], bezier.C2);
            this.upd_SVG_line(this.C2_lines[i], bezier.end, bezier.C2);
            this.upd_SVG_line(this.tunni_lines[i], bezier.C1, bezier.C2);
            this.update_path(true, i);
        }
    }

    /**
     * Ends the dragging of the Tunni Lines and resets the state of the system
     * @param {MouseEvent} e mouseup-event
     */
    end_drag_line = (e) => {
        if (sel_el && sel_el.node().tagName == "line") {
            sel_el
                .attr("stroke-width", "3px");
            sel_el = false;
        }
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
     * @param {point} a
     * @param {point} b
     * @param {point} c
     * @returns
     */
    is_left(a, b, c) {
        return Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    }
    /**
     * Returns whether last two arguments lie on the same side of first two
     * @param {point} a
     * @param {point} b
     * @param {point} c
     * @param {point} d
     * @returns
     */
    same_side(a, b, c, d) {
        return this.is_left(a, b, c) == this.is_left(a, b, d);
    }

    /**
     *
     * @param {point} a
     * @param {point} b
     * @param {point} c
     * @param {point} d
     * @returns
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
     * @returns location
     */
    tunni_location(bezier, is) {
        return point.sub(point.add(point.sub(point.mult(bezier.C1, 2), bezier.start),
            point.sub(point.mult(bezier.C2, 2), bezier.end)), is);
    }
}

//================================================================================================//
// create instances
//================================================================================================//

let X = new point(100, 100);
let C1 = new point(250, 100);
let C2 = new point(400, 250);
let Y = new point(400, 400);

let spline1 = new path(X, C1, C2, Y);

svg.on("dblclick", (e) => {
    let x = e.x;
    let y = e.y;
    let p = new point(x, y);
    console.log(p.to_string());
    spline1.add_spline(p)
})
