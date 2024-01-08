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
     * @returns {point}
     */
    static sub = (p1, p2) => {
        return new point(p1.x - p2.x, p1.y - p2.y);
    }

    /**
     * Multiplies a point / vector with a number
     * @param {point} p
     * @param {number} c
     * @returns {point}
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

    /**
     * Rotate point around another
     * @param {point} p point to rotate
     * @param {point} c rotation center
     * @param {Number} angle
     * @returns {point}
     */
    static rotate = (p, c, angle) => {
        let p1 = point.sub(p, c);
        p1.x = Math.cos(angle) - Math.sin(angle);
        p1.y = Math.sin(angle) + Math.cos(angle);
        return point.add(p1, c);
    }

    /**
     *
     * @param {point} p1 
     * @param {point} p2 
     * @param {Number} length 
     * @returns {point}
     */
    static stretch_to_length(p1, p2, length) {
        let l_prev = point.length(p1, p2);
        let p_norm = point.sub(p2, p1);
        let factor = (l_prev != 0) ? length / l_prev : 1;
        p_norm.x *= factor;
        p_norm.y *= factor;
        p2 = point.add(p1, p_norm);
        return p2;
    }

    to_string() {
        return this.x + " " + this.y;
    }
}

let point_types = {
    "corner": 0,
    "smooth": 1,
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
        /**
         * @type{point}
         */
        this.start = start;
        /**
         * @type{point}
         */
        this.C1 = C1;
        /**
         * @type{point}
         */
        this.C2 = C2;
        /**
         * @type{point}
         */
        this.end = end;
        /**
         * @type{point}
         */
        this.is_point = new point(0, 0);
        /**
         * @type{point}
         */
        this.tunni_point = new point(0, 0);

        this.start_point_type = point_types.corner;
        this.end_point_type = point_types.corner;
        this.is_start_hv_locked = false;
        this.is_end_hv_locked = false;
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
/**
 * Class representing polypath
 */
class polypath {
    constructor() {
        /**
         * @type {path[]}
         */
        this.subpaths = [];
        this.p = svg.append("path")
            .attr("stroke", "black")
            .attr("fill", "rgba(0,0,0, 0.125)");

    };

    add_path = (path) => {
        this.subpaths.push(path);
    }

    to_string = () => {
        let str = "";
        for (let subpath of this.subpaths) {
            str += " " + subpath.spline_string();
        }
        return str;
    }


}