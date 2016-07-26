require("./style.css");
import Configuration from "./constants.js" ;
import Grid from "./grid.js" ;




//const difficulty = 0.1;
//const rows = 25;
//const columns = 25;

var gameTable;

(function(){


    var grid = clickableGrid(Configuration.rows, Configuration.columns,function(el,rowIndex,col,i){
        //console.log("You clicked on element:",el);
        //console.log("is bomb",el.bomb);

        if( el.bomb )
        {
            alert("game over");
            return location.reload();
        }
        triggerNeighbors(el, rowIndex);

        //console.log("You clicked on row:",rowIndex);
        //console.log("You clicked on col:",col);
        //console.log("You clicked on item #:",i);



    });


    /**
     * Get the closest matching element up the DOM tree.
     * @param  {Element} elem     Starting element
     * @param  {String}  selector Selector to match against (class, ID, data attribute, or tag)
     * @return {Boolean|Element}  Returns null if not match found
     */
    var getClosest = function ( elem, selector ) {

        // Variables
        var firstChar = selector.charAt(0);
        var supports = 'classList' in document.documentElement;
        var attribute, value;

        // If selector is a data attribute, split attribute from value
        if ( firstChar === '[' ) {
            selector = selector.substr( 1, selector.length - 2 );
            attribute = selector.split( '=' );

            if ( attribute.length > 1 ) {
                value = true;
                attribute[1] = attribute[1].replace( /"/g, '' ).replace( /'/g, '' );
            }
        }

        // Get closest match
        for ( ; elem && elem !== document && elem.nodeType === 1; elem = elem.parentNode ) {

            // If selector is a class
            if ( firstChar === '.' ) {
                if ( supports ) {
                    if ( elem.classList.contains( selector.substr(1) ) ) {
                        return elem;
                    }
                } else {
                    if ( new RegExp('(^|\\s)' + selector.substr(1) + '(\\s|$)').test( elem.className ) ) {
                        return elem;
                    }
                }
            }

            // If selector is an ID
            if ( firstChar === '#' ) {
                if ( elem.id === selector.substr(1) ) {
                    return elem;
                }
            }

            // If selector is a data attribute
            if ( firstChar === '[' ) {
                if ( elem.hasAttribute( attribute[0] ) ) {
                    if ( value ) {
                        if ( elem.getAttribute( attribute[0] ) === attribute[1] ) {
                            return elem;
                        }
                    } else {
                        return elem;
                    }
                }
            }

            // If selector is a tag
            if ( elem.tagName.toLowerCase() === selector ) {
                return elem;
            }

        }

        return null;

    };

    function triggerNeighbors(cell, rowIndex){
        setCellNeighbors(cell, rowIndex);

    }


    function isBomb(cell){
        var randomNum  = Math.random();
        if( randomNum < Configuration.difficulty ) {
            cell.className += " bomb";
        }
        return randomNum < Configuration.difficulty;
    }

    function getPrevRow(rowIndex){
        if( rowIndex )
        {
            return gameTable.rows[rowIndex - 1]
        }else{
            return undefined
        }
    }

    function getNextRow(rowIndex){
        var rows = [].slice.call(gameTable.rows);
        if( rowIndex !== rows.length - 1)
        {
            return gameTable.rows[rowIndex + 1]
        }else {
            return undefined
        }
    }

    /**
     *
     * @param cells {HTMLTableCellElement && Array}
     * @param triggeredCell {HTMLTableCellElement}
     */
    function markAllCells(cells, triggeredCell){
        cells.push(triggeredCell);
        for (let i = 0; i < cells.length; i++) {
            let cell = cells[i];
            if( cell ) cell.className += " btn_clicked";
        }
    }

    /**
     *
     * @param cells {HTMLTableCellElement && Array}
     */
    function setNearByBombs(cells){
        let bombs = 0;
        for (let i = 0; i < cells.length; i++) {
            let cell = cells[i];
            if ( cell && cell.bomb ) bombs++
        }

        return bombs;
    }

    /**
     *
     * @param triggerCell {HTMLTableCellElement}
     * @param cells {HTMLTableCellElement && Array}
     */
    function analyzeCells(triggerCell,cells){

        let totalUndefinedCells = 0;
        for (let i = 0; i < cells.length; i++) {
            let cell = cells[i];

            if (!cell) {
                totalUndefinedCells++;
                continue;
            }

            if( cell.bomb )
            {
                //console.log(cell);
                triggerCell.nearBombs = setNearByBombs(cells);
                triggerCell.innerText = triggerCell.nearBombs;
                //triggerCell.bombCells.push(cell);
                triggerCell.className += " btn_clicked";
                return console.log("bomb in neighboring cell")

            }

        }

        if( totalUndefinedCells == cells.length) return;

        markAllCells(cells, triggerCell);

        // coast clear, mark all cells
        for (let i = 0; i < cells.length; i++) {
            let cell = cells[i];
            if( cell ) setCellNeighbors(cell, cell.parentElement.rowIndex);
        }



    }

    function isAnalyzed(cell){
        return cell && cell.className.indexOf("btn_clicked") > -1;
    }

    function cleanArray(arr, deleteValue) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == deleteValue) {
                arr.splice(i, 1);
                i--;
            }
        }
        return this;
    }

    /**
     *
     * @param cell {HTMLTableCellElement}
     * @param rowIndex {Integer}
     */
    function setCellNeighbors(cell, rowIndex){

        function getTopLeftCell(cell, row, prevRow, nextRow, cellIndex){
            if( !prevRow || !cell) return undefined;

            let cellToAnalyze = prevRow.cells[cellIndex - 1];
            if( cellToAnalyze){
                //console.log('top left cell',prevRow.cells[cellIndex - 1]);
                if ( isAnalyzed(cellToAnalyze) ) return undefined;
                return cellToAnalyze;
            }

            return undefined;

        }
        function getTopMiddleCell(cell, row, prevRow, nextRow, cellIndex){
            if( !prevRow || !cell) return undefined;

            let cellToAnalyze = prevRow.cells[cellIndex];

            //console.log('top middle cell',prevRow.cells[cellIndex]);
            if ( isAnalyzed(cellToAnalyze) ) return undefined;
            return cellToAnalyze;

        }
        function getTopRightCell(cell, row, prevRow, nextRow, cellIndex){
            if( !prevRow || !cell) return undefined;

            let cellToAnalyze = prevRow.cells[cellIndex + 1];
            if( prevRow.cells.length - 1 != cellIndex ){
                //console.log('top right cell',prevRow.cells[cellIndex + 1]);
                if ( isAnalyzed(cellToAnalyze) ) return undefined;
                return cellToAnalyze;
            }

            return undefined;
        }
        function getCenterLeftCell(cell, row, prevRow, nextRow, cellIndex) {
            let cellToAnalyze = row.cells[cellIndex - 1];
            if( cell && cellToAnalyze ){
                //console.log('center left cell',row.cells[cellIndex - 1]);
                if ( isAnalyzed(cellToAnalyze) ) return undefined;
                return cellToAnalyze;
            }

            return undefined;
        }
        function getCenterRightCell(cell, row, prevRow, nextRow, cellIndex) {
            let cellToAnalyze = row.cells[cellIndex + 1];
            if( cell && row.cells[cellIndex + 1] ){
                if ( isAnalyzed(cellToAnalyze) ) return undefined;
                //console.log('center left cell',row.cells[cellIndex + 1]);
                return cellToAnalyze;
            }

            return undefined;
        }
        function getBottomLeftCell(cell, row, prevRow, nextRow, cellIndex) {
            if( !nextRow ) return undefined;

            let cellToAnalyze = nextRow.cells[cellIndex - 1];
            if( cell ){
                if ( isAnalyzed(cellToAnalyze) ) return undefined;
                //console.log('top left cell',nextRow.cells[cellIndex - 1]);
                return cellToAnalyze;
            }

            return undefined;
        }
        function getBottomMiddleCell(cell, row, prevRow, nextRow, cellIndex) {
            if( !nextRow ) return undefined;
            let cellToAnalyze = nextRow.cells[cellIndex];
            if( cell ){
                if ( isAnalyzed(cellToAnalyze) ) return undefined;
                //console.log('top middle cell',nextRow.cells[cellIndex]);
                return cellToAnalyze;
            }

            return undefined;
        }
        function getBottomRightCell(cell, row, prevRow, nextRow, cellIndex) {
            if( !nextRow ) return undefined;

            let cellToAnalyze = nextRow.cells[cellIndex + 1];
            if( cell && nextRow.cells.length - 1 != cellIndex ){
                //console.log('bottom right cell',nextRow.cells[cellIndex + 1]);
                if ( isAnalyzed(cellToAnalyze) ) return undefined;
                return cellToAnalyze;
            }

            return undefined;
        }

        if( !cell.nearBombs ){
            cell.nearBombs   = 0;
            cell.bombCells   = [];
        }
        var prevRow     = getPrevRow(rowIndex);
        var nextRow     = getNextRow(rowIndex);
        var row         = gameTable.rows[rowIndex];

        var cellIndex = cell.cellIndex;


        //console.log("prev: ",prevRow, "next: ", nextRow);

        var topLeftCell     = getTopLeftCell(cell, row, prevRow, nextRow, cellIndex);
        var topMiddleCell   = getTopMiddleCell(cell, row, prevRow, nextRow, cellIndex);
        var topRightCell    = getTopRightCell(cell, row, prevRow, nextRow, cellIndex);

        var centerLeftCell  = getCenterLeftCell(cell, row, prevRow, nextRow, cellIndex);
        var centerRightCell = getCenterRightCell(cell, row, prevRow, nextRow, cellIndex);

        var lowerLeftCell   = getBottomLeftCell(cell, row, prevRow, nextRow, cellIndex);
        var lowerMiddleCell = getBottomMiddleCell(cell, row, prevRow, nextRow, cellIndex);
        var lowerRightCell  = getBottomRightCell(cell, row, prevRow, nextRow, cellIndex);



        var neighboringCells = [
            topLeftCell,
            topMiddleCell,
            topRightCell,
            centerLeftCell,
            centerRightCell,
            lowerLeftCell,
            lowerMiddleCell,
            lowerRightCell ];

        cleanArray(neighboringCells, undefined);
        if( !neighboringCells.length ) return;
        console.log(neighboringCells);
        analyzeCells(cell, neighboringCells)


    }

    function clickableGrid( rows, cols, callback ){
        var i=0;
        var grid = document.createElement('table');
        grid.className = 'grid';

        for (var r = 0; r < rows; ++r){

            var tr = grid.appendChild(document.createElement('tr'));

            for (var c = 0; c < cols; ++c){
                var cell = tr.appendChild(document.createElement('td'));
                cell.className = 'btn';
                //cell.innerHTML = ++i;
                cell.bomb = isBomb(cell);



                cell.addEventListener('click',(function(el,r,c,i){
                    return function(){
                        callback(el,r,c,i);
                    }
                })(cell,r,c,i),false);


                cell.addEventListener('contextmenu', function(ev) {
                    ev.preventDefault();

                    ev.target.className += " flag";
                    return false;
                }, false);

            }
        }

        document.body.appendChild(grid);
        gameTable = grid;
        return grid;
    }

})();
