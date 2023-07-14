//================================================================================================//
// full screen
//================================================================================================//

let svg = d3.select("svg");

svg.attr("width", "100%")
    .attr("height", "100%");

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
// class path contains everything that is needed ...
//================================================================================================//

class path {
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

        this.p = svg.append("path")
            .attr("stroke", "black")
            .attr("fill", "transparent");

        this.is_ui_el = svg.append("circle")
            .attr("cx", this.is_point.x + "px")
            .attr("cy", this.is_point.y + "px")
            .attr("fill", "gray")
            .attr("r", "2px")
            .attr("id", "is")
            .attr("opacity", 0);

        this.tunni_line = svg.append("line")
            .attr("x1", this.C1.x)
            .attr("y1", this.C1.y)
            .attr("x2", this.C2.x)
            .attr("y2", this.C2.y)
            .attr("stroke", "steelblue")
            .attr("stroke-width", "5px")
            .attr("opacity", 0)
            .attr("id", "tunni-line");

        // control point 1
        this.C1_line = svg.append("line")
            .attr("x1", this.start.x)
            .attr("y1", this.start.y)
            .attr("x2", this.C1.x)
            .attr("y2", this.C1.y)
            .attr("stroke-width", "1px")
            .attr("stroke", "black");

        this.C1_ui_el = svg.append("circle")
            .attr("cx", this.C1.x + "px")
            .attr("cy", this.C1.y + "px")
            .attr("fill", "lightsteelblue")
            .attr("r", "5px")
            .attr("id", "C1");

        // control point 2

        this.C2_line = svg.append("line")
            .attr("x1", this.end.x)
            .attr("y1", this.end.y)
            .attr("x2", this.C2.x)
            .attr("y2", this.C2.y)
            .attr("stroke-width", "1px")
            .attr("stroke", "black");

        this.C2_ui_el = svg.append("circle")
            .attr("cx", this.C2.x + "px")
            .attr("cy", this.C2.y + "px")
            .attr("fill", "lightsteelblue")
            .attr("r", "5px")
            .attr("id", "C2");

        this.start_ui_el = svg.append("circle")
            .attr("cx", this.start.x + "px")
            .attr("cy", this.start.y + "px")
            .attr("fill", "steelblue")
            .attr("r", "5px")
            .attr("id", "start");

        this.end_ui_el = svg.append("circle")
            .attr("cx", this.end.x + "px")
            .attr("cy", this.end.y + "px")
            .attr("fill", "steelblue")
            .attr("r", "5px")
            .attr("id", "end");

        // tunni point
        this.tunni_ui_el = svg.append("circle")
            .attr("cx", this.tunni_point.x + "px")
            .attr("cy", this.tunni_point.y + "px")
            .attr("fill", "steelblue")
            .attr("r", "5px")
            .attr("id", "tunni")
            .attr("opacity", 0);

        this.make_draggable(this.start_ui_el);
        this.make_draggable(this.end_ui_el);
        this.make_draggable(this.C1_ui_el);
        this.make_draggable(this.C2_ui_el);
        this.make_draggable(this.tunni_ui_el);

        this.make_draggable(this.tunni_line);

        this.update_path(true);
    }

    update_path(update_tunni) {
        this.p.attr("d", this.path_string());
        // update tunni point
        let is = this.intersection(this.start, this.C1, this.C2, this.end);

        if (this.same_side(this.start, this.end, this.C1, this.C2)) {
            if (this.same_side(this.start, this.end, this.C1, is)) {
                this.is_ui_el
                    .attr("opacity", 1)
                    .attr("cx", is.x)
                    .attr("cy", is.y);
                if (update_tunni) {
                    let tunni = this.tunni_location(this.start, this.C1, this.C2, this.end, is);
                    this.tunni_ui_el
                        .attr("cx", tunni.x)
                        .attr("cy", tunni.y)
                }
                this.tunni_ui_el.attr("opacity", 1)
                this.tunni_line.attr("opacity", 1);
            } else {
                this.tunni_ui_el.attr("opacity", 0);
            }
        } else {
            this.tunni_line.attr("opacity", 0);
            this.end_drag_line();
        }
    }

    /**
     * Computes "d" attribute of a cubic bezier as string
     * @returns string representing the "d" attribute of a cubic bezier splie
     */
    path_string() {
        return "M " + this.start.to_string()
            + " C " + this.C1.to_string()
            + ", " + this.C2.to_string()
            + ", " + this.end.to_string();
    }

    make_draggable(ui_el) {
        ui_el.on("mousedown", this.start_drag);
        svg.on("mousemove", this.drag);
        svg.on("mouseup", this.end_drag);
    }

    start_drag = (e) => {
        sel_el = d3.select(e.currentTarget);
        this.start_drag_node(e);
        this.start_drag_line(e);
    }

    drag = (e) => {
        this.drag_node(e);
        this.drag_line(e);
    }

    end_drag = (e) => {
        this.end_drag_node(e);
        this.end_drag_line(e);
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
            if (sel_el.attr("id") == "start") {
                this.start.x = e.x;
                this.start.y = e.y;
                this.C1_line
                    .attr("x1", e.x)
                    .attr("y1", e.y);
            } else if (sel_el.attr("id") == "end") {
                this.end.x = e.x;
                this.end.y = e.y;
                this.C2_line
                    .attr("x1", e.x)
                    .attr("y1", e.y);
            } else if (sel_el.attr("id") == "C1") {
                this.C1.x = e.x;
                this.C1.y = e.y;
                this.C1_line
                    .attr("x2", e.x)
                    .attr("y2", e.y);
                this.tunni_line
                    .attr("x1", e.x)
                    .attr("y1", e.y);
            } else if (sel_el.attr("id") == "C2") {
                this.C2.x = e.x;
                this.C2.y = e.y;
                this.C2_line
                    .attr("x2", e.x)
                    .attr("y2", e.y);
                this.tunni_line
                    .attr("x2", e.x)
                    .attr("y2", e.y);
            } else if (sel_el.attr("id") == "tunni") {
                upd_tunni = false;
                this.tunni_point.x = e.x;
                this.tunni_point.y = e.y;

                let C1_halfway_point = new point((e.x + this.start.x) / 2,
                    (e.y + this.start.y) / 2);
                let C2_vector = new point(this.C2.x - this.end.x + C1_halfway_point.x,
                    this.C2.y - this.end.y + C1_halfway_point.y);
                let C1_intersection = this.intersection(C1_halfway_point, C2_vector,
                    this.start, this.C1);

                this.C1.x = C1_intersection.x;
                this.C1.y = C1_intersection.y;

                this.C1_ui_el
                    .attr("cx", this.C1.x)
                    .attr("cy", this.C1.y);
                this.C1_line
                    .attr("x2", this.C1.x)
                    .attr("y2", this.C1.y);

                let C2_halfway_point = new point((e.x + this.end.x) / 2, (e.y + this.end.y) / 2);
                let C1_vector = new point(this.C1.x - this.start.x + C2_halfway_point.x,
                    this.C1.y - this.start.y + C2_halfway_point.y);
                let C2_intersection = this.intersection(C2_halfway_point,
                    C1_vector, this.end, this.C2);

                this.C2.x = C2_intersection.x;
                this.C2.y = C2_intersection.y;

                this.C2_ui_el
                    .attr("cx", this.C2.x)
                    .attr("cy", this.C2.y);
                this.C2_line
                    .attr("x2", this.C2.x)
                    .attr("y2", this.C2.y);
                this.tunni_line
                    .attr("x1", this.C1.x)
                    .attr("y1", this.C1.y)
                    .attr("x2", this.C2.x)
                    .attr("y2", this.C2.y);
            }
            this.update_path(upd_tunni);
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
            this.tunni_line
                .attr("stroke-width", "10px");
        }
    }

    drag_line = (e) => {
        if (sel_el && sel_el.node().tagName == "line") {
            let tl_vector = new point(e.x + this.C2.x - this.C1.x, e.y + this.C2.y - this.C1.y);
            this.C1 = this.intersection(e, tl_vector, this.start, this.C1);
            this.C2 = this.intersection(e, tl_vector, this.end, this.C2);
            this.C1_ui_el
                .attr("cx", this.C1.x)
                .attr("cy", this.C1.y);
            this.C1_line
                .attr("x2", this.C1.x)
                .attr("y2", this.C1.y);
            this.C2_ui_el
                .attr("cx", this.C2.x)
                .attr("cy", this.C2.y);
            this.C2_line
                .attr("x2", this.C2.x)
                .attr("y2", this.C2.y);
            this.tunni_line
                .attr("x1", this.C1.x)
                .attr("y1", this.C1.y)
                .attr("x2", this.C2.x)
                .attr("y2", this.C2.y);
            this.update_path(true);
        }
    }

    end_drag_line = (e) => {
        if (sel_el && sel_el.node().tagName == "line") {
            this.tunni_line
                .attr("stroke-width", "5px");
            sel_el = false;
        }
    }


    /**
     *
     * @param {point} p
     */
    draw_point(p) {
        svg.append("circle")
            .attr("cx", p.x)
            .attr("cy", p.y)
            .attr("r", 1)
            .attr("fill", "red");
    }

    /**
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
     * @param {*} a 
     * @param {*} b 
     * @param {*} c 
     * @param {*} d 
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

let path1 = new path(X, C1, C2, Y);





