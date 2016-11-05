/*
 * Game of live 
 * Copyright ©  2016 JP Jorda, jpjorda gmail
   This file is part of gameoflife.
   gameoflife is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, see <http://www.gnu.org/licenses>
  
*/

/// <reference path="jquery.d.ts"/>
class GameOfLife {
    public cells: boolean[][];
    private _running: boolean = false;
    private _nbCells: number = 0;
    private imax: number;
    private jmax: number;
    private timeout: number;
    private running: boolean;

    public display: GoLDisplay;

    constructor(display: GoLDisplay, imax: number, jmax: number, timeout: number) {
        this.display = display;
        this.imax = imax;
        this.jmax = jmax;
        this.timeout = timeout;
        this.cells = [];
        this.display.golEngine = this;
        this.display.init(this.imax, this.jmax);
        for (let i = 0; i <= this.imax; i++) {
            this.cells[i] = [];
            for (let j = 0; j <= this.jmax; j++) {
                this.cells[i][j] = false;
                this.display.update(i, j, false);
            }
        }
    }

    public flipCell(i: number, j: number) {
        if ((i < 0 || i > this.imax)
            || (j < 0 || j > this.jmax)) {
            return;
        }
        this.cells[i][j] = !this.cells[i][j];
        this.display.update(i, j, this.cells[i][j])
    }

    public val(i: number, j: number): boolean {
        return this.cells[i][j];
    }

    private _delayedCompute(self: GameOfLife, i: number, n: number) {
        self._compute();
        let a = self._delayedCompute;
        i++;
        if (i >= n || (!self._running)) {
            return;
        }
        setTimeout(function () {
            a(self, i, n);
        }, self.timeout);
    }

    public run() {
        this._running = true;
        this._delayedCompute(this, 0, this.timeout);
    }

    public stop() {
        this._running = false;
    }

    private _compute() {
        let newCells: boolean[][] = [];
        for (let i = 0; i <= this.imax; i++) {
            newCells[i] = [];
            for (let j = 0; j <= this.imax; j++) {
                let newval: boolean;
                let nn = this._getNeighbours(i, j);
                if (this.cells[i][j]) {
                    if (nn === 2 || nn === 3) {
                        newval = true;
                    } else {
                        newval = false;
                    }
                } else if (nn === 3) {
                    newval = true;
                } else {
                    newval = false;
                }
                newCells[i][j] = newval;
            }
        }
        this._nbCells = 0;
        for (let i = 0; i <= this.imax; i++) {
            for (let j = 0; j <= this.imax; j++) {
                if (this.cells[i][j] !== newCells[i][j]) {
                    this.cells[i][j] = newCells[i][j];
                    if (this.cells[i][j]) {
                        this._nbCells++;
                    }
                    this.display.update(i, j, this.cells[i][j]);
                }
            }

        }
    }

    private _getNeighbours(i: number, j: number): number {
        let nn = 0;
        let imin = (i === 0 ? 0 : i - 1);
        let imax = (i === this.imax ? this.imax : i + 1);
        let jmin = (j === 0 ? 0 : j - 1);
        let jmax = (j === this.jmax ? this.jmax : j + 1);
        for (let ii = imin; ii <= imax; ii++) {
            for (let jj = jmin; jj <= jmax; jj++) {
                if (!(i === ii && j === jj) && this.cells[ii][jj]) {
                    nn++;
                }
            }
        }
        return nn;
    }

    private _show() {
        console.log(this.__asString());
    }

    private __asString(): string {
        let grid: string = '';
        for (let i = 0; i <= this.imax; i++) {
            for (let j = 0; j <= this.jmax; j++) {
                if (this.cells[i][j]) {
                    grid += '*';
                } else {
                    grid += ' ';
                }
                grid += "\n";
            }
        }
        return grid;
    }

}

interface GoLDisplay {
    golEngine: GameOfLife;

    init(lx: number, ly: number): void;
    update(i: number, j: number, val: boolean): void;
}

/* ------------------------
 * Game "display"
 * see also gameoflife.css
 * You can provide your own
 * display:
 * provide a class with
 * an init(imax,jmax) function
 * an update(i,j,val) function
 * 
 * -----------------------
 */

class GoLGrid implements GoLDisplay {
    public node: any;
    private lx: number;
    private ly: number;
    public golEngine: GameOfLife;

    public constructor(node: any) {
        this.node = node;
    }

    public init(lx: number, ly: number) {
        this.lx = lx;
        this.ly = ly;
        this._mkgrid();
    }

    public update(i: number, j: number, val: boolean) {
        if (val) {
            this.node.find(" td[data-i = " + i + "][data-j = " + j + "]")
                .removeClass("gol-dead")
                .addClass("gol-alive");
        } else {
            this.node.find(" td[data-i = " + i + "][data-j = " + j + "]")
                .removeClass("gol-alive")
                .addClass("gol-dead");
        }
    }

    private _mkgrid() {
        this.node.html("Loading...");
        let width: number = $(document).width();
        let height: number = $(document).height();
        let di: number = width / (this.lx + 1);
        let dj: number = height / (this.ly + 1);
        let csize = Math.min(di, dj);
        let content = '<table id="gol">';
        for (let i = 0; i <= this.lx; i++) {
            content += '<tr>';
            for (let j = 0; j <= this.ly; j++) {
                content += "<td data-i=" + i
                    + " data-j=" + j
                    + " class='gol-cell gol-dead'></td>";
            }
        }
        content += '</tr>';
        content += '</table>';
        this.node.html(content);
        let self = this;
        $('.gol-cell')
            .css('width', csize)
            .css('height', csize)
            .click(function () { self._flipCell($(this)) });
    }

    private _flipCell(node: any) {
        let i = node.attr('data-i');
        let j = node.attr('data-j');
        this.golEngine.flipCell(i, j);
    }
}
