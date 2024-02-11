/**
 * Class representing polypath
 */
class polypath {
    constructor(append = true) {
        /**
         * @type {path[]}
         */
        this.subpaths = [];
        this.p;
        if (!append) {
            this.p = d3.select("path");
            return;
        }
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

    clone() {
        let new_pp = new polypath(false);
        for (let subpath of this.subpaths) {
            new_pp.add_path(subpath.clone(new_pp));
        }
        return new_pp;
    }

    redraw_polypath(add_new_ui = false) {
        svg.selectAll("svg > path").attr("d", "");
        svg.selectAll("svg > #ui > g > *").remove();
        // redraw
        for (let subpath of pp.subpaths) {
            // subpath.clear_ui();
            console.log("adding ui");
            subpath.clear_ui();
            subpath.add_ui();
            subpath.update_path(true, 0);
        }
    }
}