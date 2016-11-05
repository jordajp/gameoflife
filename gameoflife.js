var GameOfLife = (function () {
    function GameOfLife(display, imax, jmax, timeout) {
        this._running = false;
        this._nbCells = 0;
        this.display = display;
        this.imax = imax;
        this.jmax = jmax;
        this.timeout = timeout;
        this.cells = [];
        this.display.golEngine = this;
        this.display.init(this.imax, this.jmax);
        for (var i = 0; i <= this.imax; i++) {
            this.cells[i] = [];
            for (var j = 0; j <= this.jmax; j++) {
                this.cells[i][j] = false;
                this.display.update(i, j, false);
            }
        }
    }
    GameOfLife.prototype.flipCell = function (i, j) {
        if ((i < 0 || i > this.imax)
            || (j < 0 || j > this.jmax)) {
            return;
        }
        this.cells[i][j] = !this.cells[i][j];
        this.display.update(i, j, this.cells[i][j]);
    };
    GameOfLife.prototype.val = function (i, j) {
        return this.cells[i][j];
    };
    GameOfLife.prototype._delayedCompute = function (self, i, n) {
        self._compute();
        var a = self._delayedCompute;
        i++;
        if (i >= n || (!self._running)) {
            return;
        }
        setTimeout(function () {
            a(self, i, n);
        }, self.timeout);
    };
    GameOfLife.prototype.run = function () {
        this._running = true;
        this._delayedCompute(this, 0, this.timeout);
    };
    GameOfLife.prototype.stop = function () {
        this._running = false;
    };
    GameOfLife.prototype._compute = function () {
        var newCells = [];
        for (var i = 0; i <= this.imax; i++) {
            newCells[i] = [];
            for (var j = 0; j <= this.imax; j++) {
                var newval = void 0;
                var nn = this._getNeighbours(i, j);
                if (this.cells[i][j]) {
                    if (nn === 2 || nn === 3) {
                        newval = true;
                    }
                    else {
                        newval = false;
                    }
                }
                else if (nn === 3) {
                    newval = true;
                }
                else {
                    newval = false;
                }
                newCells[i][j] = newval;
            }
        }
        this._nbCells = 0;
        for (var i = 0; i <= this.imax; i++) {
            for (var j = 0; j <= this.imax; j++) {
                if (this.cells[i][j] !== newCells[i][j]) {
                    this.cells[i][j] = newCells[i][j];
                    if (this.cells[i][j]) {
                        this._nbCells++;
                    }
                    this.display.update(i, j, this.cells[i][j]);
                }
            }
        }
    };
    GameOfLife.prototype._getNeighbours = function (i, j) {
        var nn = 0;
        var imin = (i === 0 ? 0 : i - 1);
        var imax = (i === this.imax ? this.imax : i + 1);
        var jmin = (j === 0 ? 0 : j - 1);
        var jmax = (j === this.jmax ? this.jmax : j + 1);
        for (var ii = imin; ii <= imax; ii++) {
            for (var jj = jmin; jj <= jmax; jj++) {
                if (!(i === ii && j === jj) && this.cells[ii][jj]) {
                    nn++;
                }
            }
        }
        return nn;
    };
    GameOfLife.prototype._show = function () {
        console.log(this.__asString());
    };
    GameOfLife.prototype.__asString = function () {
        var grid = '';
        for (var i = 0; i <= this.imax; i++) {
            for (var j = 0; j <= this.jmax; j++) {
                if (this.cells[i][j]) {
                    grid += '*';
                }
                else {
                    grid += ' ';
                }
                grid += "\n";
            }
        }
        return grid;
    };
    return GameOfLife;
}());
var GoLGrid = (function () {
    function GoLGrid(node) {
        this.node = node;
    }
    GoLGrid.prototype.init = function (lx, ly) {
        this.lx = lx;
        this.ly = ly;
        this._mkgrid();
    };
    GoLGrid.prototype.update = function (i, j, val) {
        if (val) {
            this.node.find(" td[data-i = " + i + "][data-j = " + j + "]")
                .removeClass("gol-dead")
                .addClass("gol-alive");
        }
        else {
            this.node.find(" td[data-i = " + i + "][data-j = " + j + "]")
                .removeClass("gol-alive")
                .addClass("gol-dead");
        }
    };
    GoLGrid.prototype._mkgrid = function () {
        this.node.html("Loading...");
        var width = $(document).width();
        var height = $(document).height();
        var di = width / (this.lx + 1);
        var dj = height / (this.ly + 1);
        var csize = Math.min(di, dj);
        var content = '<table id="gol">';
        for (var i = 0; i <= this.lx; i++) {
            content += '<tr>';
            for (var j = 0; j <= this.ly; j++) {
                content += "<td data-i=" + i
                    + " data-j=" + j
                    + " class='gol-cell gol-dead'></td>";
            }
        }
        content += '</tr>';
        content += '</table>';
        this.node.html(content);
        var self = this;
        $('.gol-cell')
            .css('width', csize)
            .css('height', csize)
            .click(function () { self._flipCell($(this)); });
    };
    GoLGrid.prototype._flipCell = function (node) {
        var i = node.attr('data-i');
        var j = node.attr('data-j');
        this.golEngine.flipCell(i, j);
    };
    return GoLGrid;
}());
//# sourceMappingURL=gameoflife.js.map