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

        // control point 2

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
        let is = this.intersection(bezier.start, bezier.C1, bezier.C2, bezier.end);

        if (this.same_side(bezier.start, bezier.end, bezier.C1, bezier.C2)) {
            if (this.same_side(bezier.start, bezier.end, bezier.C1, is)) {
                this.is_ui_els[i]
                    .attr("opacity", 1)
                    .attr("cx", is.x)
                    .attr("cy", is.y);
                if (update_tunni) {
                    let tunni = this.tunni_location(bezier.start, bezier.C1, bezier.C2, bezier.end, is);
                    this.tunni_ui_els[i]
                        .attr("cx", tunni.x)
                        .attr("cy", tunni.y)
                }
                this.tunni_ui_els[i].attr("opacity", 1)
                this.tunni_lines[i].attr("opacity", 1);
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
        let C1_scale = (Math.sqrt((bezier.C1.x - bezier.start.x) ** 2 + (bezier.C1.y - bezier.start.y) ** 2))
            / (Math.sqrt((is.x - bezier.start.x) ** 2 + (is.y - bezier.start.y) ** 2));

        let C2_scale = (Math.sqrt((bezier.C2.x - bezier.end.x) ** 2 + (bezier.C2.y - bezier.end.y) ** 2))
            / (Math.sqrt((is.x - bezier.end.x) ** 2 + (is.y - bezier.end.y) ** 2));


        let avg = (C1_scale + C2_scale) / 2;

        bezier.C1.x = bezier.start.x + avg * (is.x - bezier.start.x);
        bezier.C1.y = bezier.start.y + avg * (is.y - bezier.start.y);
        bezier.C2.x = bezier.end.x + avg * (is.x - bezier.end.x);
        bezier.C2.y = bezier.end.y + avg * (is.y - bezier.end.y);

        this.C1_ui_els[i]
            .attr("cx", bezier.C1.x)
            .attr("cy", bezier.C1.y);
        this.C1_lines[i]
            .attr("x2", bezier.C1.x)
            .attr("y2", bezier.C1.y);

        this.C2_ui_els[i]
            .attr("cx", bezier.C2.x)
            .attr("cy", bezier.C2.y);
        this.C2_lines[i]
            .attr("x2", bezier.C2.x)
            .attr("y2", bezier.C2.y);
        this.tunni_lines[i]
            .attr("x1", bezier.C1.x)
            .attr("y1", bezier.C1.y)
            .attr("x2", bezier.C2.x)
            .attr("y2", bezier.C2.y)
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


            if (sel_el.attr("id") == "start") {
                let dx = bezier.C1.x - bezier.start.x;
                let dy = bezier.C1.y - bezier.start.y;
                bezier.start.x = e.x;
                bezier.start.y = e.y;
                bezier.C1.x = bezier.start.x + dx;
                bezier.C1.y = bezier.start.y + dy;
                C1_line
                    .attr("x1", e.x)
                    .attr("y1", e.y)
                    .attr("x2", bezier.C1.x)
                    .attr("y2", bezier.C1.y);
                C1_ui_el
                    .attr("cx", bezier.C1.x)
                    .attr("cy", bezier.C1.y);
                tunni_line
                    .attr("x1", bezier.C1.x)
                    .attr("y1", bezier.C1.y);
            } else if (sel_el.attr("id") == "end") {
                let dx = bezier.C2.x - bezier.end.x;
                let dy = bezier.C2.y - bezier.end.y;
                let next_dx;
                let next_dy;
                // if next_bezier is defined ...
                if (i < this.splines.length - 1) {
                    next_dx = next_bezier.C1.x - bezier.end.x;
                    next_dy = next_bezier.C1.y - bezier.end.y;
                }
                bezier.end.x = e.x;
                bezier.end.y = e.y;
                bezier.C2.x = bezier.end.x + dx;
                bezier.C2.y = bezier.end.y + dy;
                if (i < this.splines.length - 1) {
                    next_bezier.C1.x = e.x + next_dx;
                    next_bezier.C1.y = e.y + next_dy;

                    this.C1_lines[i + 1]
                        .attr("x1", next_bezier.start.x)
                        .attr("y1", next_bezier.start.y)
                        .attr("x2", next_bezier.C1.x)
                        .attr("y2", next_bezier.C1.y);
                    this.C1_ui_els[i + 1]
                        .attr("cx", next_bezier.C1.x)
                        .attr("cy", next_bezier.C1.y);
                    this.tunni_lines[i + 1]
                        .attr("x1", next_bezier.C1.x)
                        .attr("y1", next_bezier.C1.y);
                }


                C2_line
                    .attr("x1", e.x)
                    .attr("y1", e.y)
                    .attr("x2", bezier.C2.x)
                    .attr("y2", bezier.C2.y);
                C2_ui_el
                    .attr("cx", bezier.C2.x)
                    .attr("cy", bezier.C2.y);
                tunni_line
                    .attr("x2", bezier.C2.x)
                    .attr("y2", bezier.C2.y);
            } else if (sel_el.attr("id") == "C1") {
                bezier.C1.x = e.x;
                bezier.C1.y = e.y;
                C1_line
                    .attr("x2", e.x)
                    .attr("y2", e.y);
                tunni_line
                    .attr("x1", e.x)
                    .attr("y1", e.y);
            } else if (sel_el.attr("id") == "C2") {
                bezier.C2.x = e.x;
                bezier.C2.y = e.y;
                C2_line
                    .attr("x2", e.x)
                    .attr("y2", e.y);
                tunni_line
                    .attr("x2", e.x)
                    .attr("y2", e.y);
            } else if (sel_el.attr("id") == "tunni") {
                upd_tunni = false;
                bezier.tunni_point.x = e.x;
                bezier.tunni_point.y = e.y;

                let C1_halfway_point = new point((bezier.tunni_point.x + bezier.start.x) / 2,
                    (bezier.tunni_point.y + bezier.start.y) / 2);
                let C2_vector = new point(bezier.C2.x - bezier.end.x + C1_halfway_point.x,
                    bezier.C2.y - bezier.end.y + C1_halfway_point.y);
                let C1_intersection = this.intersection(C1_halfway_point, C2_vector,
                    bezier.start, bezier.C1);

                bezier.C1.x = C1_intersection.x;
                bezier.C1.y = C1_intersection.y;

                C1_ui_el
                    .attr("cx", bezier.C1.x)
                    .attr("cy", bezier.C1.y);
                C1_line
                    .attr("x2", bezier.C1.x)
                    .attr("y2", bezier.C1.y);

                let C2_halfway_point = new point((bezier.tunni_point.x + bezier.end.x) / 2,
                    (bezier.tunni_point.y + bezier.end.y) / 2);
                let C1_vector = new point(bezier.C1.x - bezier.start.x + C2_halfway_point.x,
                    bezier.C1.y - bezier.start.y + C2_halfway_point.y);
                let C2_intersection = this.intersection(C2_halfway_point,
                    C1_vector, bezier.end, bezier.C2);

                bezier.C2.x = C2_intersection.x;
                bezier.C2.y = C2_intersection.y;

                C2_ui_el
                    .attr("cx", bezier.C2.x)
                    .attr("cy", bezier.C2.y);
                C2_line
                    .attr("x2", bezier.C2.x)
                    .attr("y2", bezier.C2.y);
                tunni_line
                    .attr("x1", bezier.C1.x)
                    .attr("y1", bezier.C1.y)
                    .attr("x2", bezier.C2.x)
                    .attr("y2", bezier.C2.y);
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
        if (sel_el && sel_el.node().tagName == "line") {
            let i = sel_el.attr("spline_nr")
            let bezier = this.splines[i];
            let tl_vector = new point(e.x + bezier.C2.x - bezier.C1.x,
                e.y + bezier.C2.y - bezier.C1.y);
            bezier.C1 = this.intersection(e, tl_vector, bezier.start, bezier.C1);
            bezier.C2 = this.intersection(e, tl_vector, bezier.end, bezier.C2);
            this.C1_ui_els[i]
                .attr("cx", bezier.C1.x)
                .attr("cy", bezier.C1.y);
            this.C1_lines[i]
                .attr("x2", bezier.C1.x)
                .attr("y2", bezier.C1.y);
            this.C2_ui_els[i]
                .attr("cx", bezier.C2.x)
                .attr("cy", bezier.C2.y);
            this.C2_lines[i]
                .attr("x2", bezier.C2.x)
                .attr("y2", bezier.C2.y);
            this.tunni_lines[i]
                .attr("x1", bezier.C1.x)
                .attr("y1", bezier.C1.y)
                .attr("x2", bezier.C2.x)
                .attr("y2", bezier.C2.y);
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
     * @param {point} a start
     * @param {point} c1 control point 1
     * @param {point} c2 control point 2
     * @param {point} b end
     * @param {point} is intersection of the control point vectors
     * @returns location
     */
    tunni_location(a, c1, c2, b, is) {
        let tunni_x = 2 * c1.x - a.x + 2 * c2.x - b.x - is.x;
        let tunni_y = 2 * c1.y - a.y + 2 * c2.y - b.y - is.y;
        return new point(tunni_x, tunni_y);
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




