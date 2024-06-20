class undo_history {
    constructor(max_history_length = 100) {
        /**
         * @type{polypath[]}
         */
        this.history = [];

        /**
         * @type{number}
         */
        this.MAX_HISTORY_LENGTH = max_history_length;

        /**
         * @type{number}
         */
        this.history_index = -1;
    }

    push(pp) {
        if (history.length >= this.MAX_HISTORY_LENGTH) {
            console.warn("history is full -- truncating history!");
            history.shift();
        }
        // clear the history after the current index
        this.history = this.history.slice(0, this.history_index + 1);
        this.history_index++;
        this.history.push(pp.clone());
    }

    /**
     * Steps **back** in the history
     * @param {polypath} pp the current state
     * @returns polypath the previous state (if it exists) or the current state `pp`
     */
    step_back(pp) {
        console.log()
        if (this.history_index <= 0) {
            console.warn("no more history -- cannot undo!");
            // return the same polypath if there is no more history
            return pp;
        }
        if (this.history.length >= 100) {
            console.warn("history is full -- truncating history!");
            this.history.shift();
            this.history_index--;
        }
        pp = this.history[this.history_index - 1];
        this.history_index--;
        return pp.clone();
    }

    /**
     * Steps **forward** in the history
     * @param {polypath} pp the current state
     * @returns polypath the next state (if it exists) or the current state `pp`
     */
    step_forward(pp) {
        if (this.history_index >= this.history.length - 1) {
            console.warn("no more history -- cannot redo!");
            return pp;
        }
        this.history_index++;
        pp = this.history[this.history_index];
        return pp.clone();
    }

    /**
     * Returns the current history
     * @returns polypath[] the current history
     */
    getHistory() {
        return this.history;
    }

    log_state(extensive = false) {
        console.log("history.length: " + this.history.length);
        console.log("history_index: " + this.history_index);
        if (extensive) {
            console.log(this.history);
        }
    }
}