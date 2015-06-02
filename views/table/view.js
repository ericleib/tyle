
registerView({
  name : "table",
  dependencies : {
    javascript: ["views/table/js/jquery.dataTables.min.js"],
    css: ["views/table/css/jquery.dataTables.css"],
  },
  render : function(scope, element, data){

    var columns =
    Object.getOwnPropertyNames(data)
    .filter(function(name){ return /header\d+/.test(name); })
    .sort()
    .map(function(name){ return {title : data[name], class: 'center'}; });

    var rows = getRows(data.row);

    $(element).html( '<table cellpadding="0" cellspacing="0" border="0" class="display"></table>' );
    $(element).children().dataTable({
        data: rows,
        columns: columns
    } );

    function getRows(data){
      var rows = [], offset=0;
      data.forEach(function(row){

        if(Array.isArray(row)){

          rows.push(row); // The "natural" way

        } else {

          if(row.hasOwnProperty("row")){
            rows = rows.concat(getRows(row.row));
          }

          var cols =
          Object.getOwnPropertyNames(row)
          .filter(function(name){ return /col\d+/.test(name); })
          .sort()
          .map(function(name){ return {col: parseInt(name.match(/col(\d+)/)[1])-1, val: row[name]}; });

          var maxlength = cols.reduce(function(prev, next){   // Get largest column length
            return Math.max(prev, next.val.length || 1);
          }, 0);

          maxlength = Math.max(maxlength, rows.length-offset);  // If nested rows, we take the largest one

          for(var i=0; i<maxlength; i++){
            if(!rows[offset+i])
              rows[offset+i] = [];
            cols.forEach(function(c){
              rows[offset+i][c.col] = c.val.length? (i<c.val.length? c.val[i] : null) : c.val; // Array ( not over : over ) : Scalar
            });
          }
          offset += maxlength;
        }
      });

      return rows;
    }

  }
});
