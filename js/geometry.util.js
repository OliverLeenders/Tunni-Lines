class geometry {
    /**
     * Returns whether point c is left of the line a-b;
     * @param {point} a first point of line
     * @param {point} b second point of line
     * @param {point} c point to check
     * @returns {number} -1 if c is left, 1 if c is right, 0 if c is on the line
     */
    static is_left(a, b, c) {
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
    static same_side(a, b, c, d) {
        return this.is_left(a, b, c) == this.is_left(a, b, d);
    }

    /**
     * Returns the intersection point of two lines defined by two points each
     * @param {point} a1 first point of first line
     * @param {point} a2 second point of first line
     * @param {point} b1 first point of second line
     * @param {point} b2 second point of second line
     * @returns {point} intersection point
     */
    static intersection(a1, a2, b1, b2) {
        let denominator = ((b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y))
        if (denominator == 0) {
            return new point(b2.x, b2.y);
        }
        let scale_x = ((b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x)) / denominator;
        let x_coord = a1.x + scale_x * (a2.x - a1.x);
        let y_coord = a1.y + scale_x * (a2.y - a1.y);
        return new point(x_coord, y_coord);
    }

    /**
     * Computes the location of the tunni point
     *
     * @param {bezier} s
     * @param {point} is intersection of the control point vectors
     * @returns {point} location of the tunni point
     */
    static tunni_location(bezier, is) {
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
    static angle_between = (p1, p2, p3, p4) => {
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
    static distance_line_to_point = (p1, p2, p3) => {
        let v1 = point.sub(p2, p1);
        let v2 = point.sub(p3, p1);
        let det = v1.x * v2.y - v1.y * v2.x;
        return Math.abs(det) / Math.sqrt(v1.x ** 2 + v1.y ** 2);
    }


}