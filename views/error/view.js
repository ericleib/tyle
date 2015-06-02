
registerView({
  name : "error",
  dependencies : {
    javascript: [],
    css: [],
  },
  render : function(scope, element, data){
    $(element).html("<div class='col-xs-12 alert alert-danger'>"+
        "<strong>Error: </strong>"+data.engine.description+"</div>");
  }

});
