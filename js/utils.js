
app.factory('utils', function(){
  var exports = {

    parseSeparatedString: function(text){
      var regex = /'([^']*)'|"([^"]*)"|([^"'\s]+)/g;  // Regex to separate strings/quoted strings
      var match = regex.exec(text);
      var array = [];
      while (match !== null) {
          var word = match[1] || match[2] || match[3];
          array.push(word);
          match = regex.exec(text);
      }
      return array;
    },

    parseNumber: function(text){
      var res = parseFloat(text);
      if(isNaN(res)){
        throw "NaN found in "+text;
      }
      return res;
    },

    parseInteger: function(text){
      var res = parseInt(text);
      if(isNaN(res)){
        throw "NaN found in "+text;
      }
      return res;
    },

    traverse: function traverse(node, cb, depth){
      cb(node, depth || 0);
      if(node.hasOwnProperty("children")){
        node.children.forEach(function(child){
          traverse(child, cb, (depth||0)+1);
        });
      }
    },

    testScalarOrArray: function testScalarOrArray(val, check){
      if(!Array.isArray(val)){
        return check(val);
      }else{
        return testArray(val, check);
      }
    },

    testArray: function(array, check){
      for(var i=0; i<array.length; i++){
        var res = check(array[i], array, i);  // Check signature: check(item, array, index)
        if(!res.valid)
          return res;
      }
      return {valid : true};
    },

    validate: function (test, msg){
      return test? {valid : true} : {valid : false, msg : msg};
    },

    validateType: function(node, type){
      return exports.validate(typeof node.value === type, node.value+" is not a "+type+" !");
    },

    get: function(key) {
      for(var i=0; i<this.children.length; i++){
        var child = this.children[i];
        if(child.name===key){
          return child;
        }
      }
    },

    getGetter: function(prop){
      return function(){
        return prop;
      };
    },

    Exception: function(message, ex){
      this.message = message;
      this.ex = ex;
    }

  };

  return exports;

});
