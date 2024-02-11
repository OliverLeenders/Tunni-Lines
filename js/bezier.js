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

        this.start_point_type = point.point_types.corner;
        this.end_point_type = point.point_types.corner;
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

    /**
     * Creates a clone of the bezier spline
     * @returns {bezier} clone
     */
    clone() {
        return new bezier(this.start.clone(), this.C1.clone(), this.C2.clone(), this.end.clone());
    }
}
