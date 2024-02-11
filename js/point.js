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

    static point_types = {
        "corner": 0,
        "smooth": 1,
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
     * @param {point} p1 first point (origin)
     * @param {point} p2 second point (point to move)
     * @param {Number} length length to be stretched to
     * @returns {point} new point with distance `length` from `p1`
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

    /**
     * Creates a string representation of the point
     * @returns {String} string
     */
    to_string() {
        return this.x + " " + this.y;
    }

    /**
     * Creates a clone of the point
     * @returns {point} clone
     */
    clone() {
        return new point(this.x, this.y);
    }
}
