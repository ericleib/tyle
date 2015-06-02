

app.factory('default-types', ['utils', function(utils){

  var ILLEGAL_ATTR = ["name", "attributes", "children", "value", "isselfclosing"];  // Reserved names (not attributes)


  // CONSTRUCTORS

  var Type = function(name, container, attr) {
    this.name = name; // Name of the type
    this.container = container; // Whether this type is a container or not
    this.getValidAttr = utils.getGetter(attr);   // Allowed attributes for this type
  };

  Type.prototype.parseValue = function(text){ // Parses the text input of a node and returns data (of any type) (should be overriden, depending on type)
    return text;
  };

  Type.prototype.parseAttribute = function(name, value){
    for(var i=0; i<this.getValidAttr().length; i++){
      var attr = this.getValidAttr()[i];
      if(name===attr.name)
        return attr.parseValue(value);
    }
    return value;
  };

  Type.prototype.validateNode = function(node){ // Verifies if a node is correctly defined (should be overriden, depending on type).
    var res = [];
    if(this.container && node.hasOwnProperty("value")){
      res.push({valid : false, msg : node.name+" is a container so it should not have a value"});
    }else if(this.container && ! node.hasOwnProperty("value")){
      res.push({valid : true});
    }else if((!this.container) && node.hasOwnProperty("value")){
      res.push({valid : true});
    }else{
      res.push({valid : false, msg : node.name+" does not have a value"});
    }

    this.getValidAttr().forEach(function(attr){
      if(attr.validable && node.hasOwnProperty(attr.name)){
        res.push(attr.validate(node));
      }
    });
    return res;
  };



  var Attribute = function(name, validable, enforcable) {
    this.name = name;
    this.validable = validable;
    this.enforcable = enforcable;
  };

  Attribute.prototype.parseValue = function(text){
    return text;
  };

  Attribute.prototype.validate = function(node){
    return {valid : true};
  };

  Attribute.prototype.enforce = function(node){
    if(!this.enforcable)
      throw new utils.Exception("This attribute ("+this.name+") is not enforcable");
  };



  //==============================================================================
  // ATTRIBUTES

  var
  TAG = new Attribute("tag", false, false),
  VIEWS = new Attribute("views", false, false),
  REQUIRED = new Attribute("required", true, false),
  REGEXP = new Attribute("regexp", true, false),
  ORDERED = new Attribute("ordered-by", true, true),
  MIN = new Attribute("min", true, true),
  MAX = new Attribute("max", true, true),
  MINSIZE = new Attribute("min-size", true, true),
  MAXSIZE = new Attribute("max-size", true, true),
  MINLENGTH = new Attribute("min-length", true, true),
  MAXLENGTH = new Attribute("max-length", true, true);


  // PARSERS

  TAG.parseValue = utils.parseSeparatedString;

  VIEWS.parseValue = function(text){
    return text
      .split(/\s*,\s*/g)   // Coma-separated views
      .map(function(v){
        var resplit = v.split(/\s+as\s+/);  // Separate path from alias
        v = {path: resplit[0].split(".")};  // Dotted notation for paths
        if(resplit.length===2)
          v.alias = resplit[1];
        return v;
      });
  };

  REQUIRED.parseValue = function(text){
    return text.toLowerCase()==='true';     // Won't throw an exception
  };

  REGEXP.parseValue = function(text){
    return new RegExp(text);      // Throws exception if malformed
  };

  ORDERED.parseValue = function(text){
    return text;    // No parsing here. It will depend on the type
  };

  MIN.parseValue = utils.parseNumber;
  MAX.parseValue = utils.parseNumber;
  MINSIZE.parseValue = utils.parseInteger;
  MAXSIZE.parseValue = utils.parseInteger;
  MINLENGTH.parseValue = utils.parseInteger;
  MAXLENGTH.parseValue = utils.parseInteger;


  // VALIDATORS

  TAG.validate = function(node){ throw new utils.Exception("Not validable");};
  VIEWS.validate = function(node){ throw new utils.Exception("Not validable");};

  REQUIRED.validate = function(node){
    return {valid : true};  // If the node exists, it's ok (TODO: find a way to check when it doesn't !!)
  };

  REGEXP.validate = function(node){
    var regex = node[this.name];
    return utils.testScalarOrArray(node.value, function(value){
      return utils.validate( regex.test(value),  value+" does not match regexp "+node.regexp);
    });
  };

  ORDERED.validate = function(node){
    if(node.hasOwnProperty("value")){ // Works for value (e.g. real-array)
      return {valid : true};    // TODO: What syntax ?

    }else{  // Works for children (e.g. array)
      var key = node[this.name];  // eg ordered-by="aReal"
      var array = node.children.map(function(item){ return item.get(key);}); // Create an array with only the value to check
      return utils.testArray(array, function(item, array, index){
        if(typeof item === 'undefined')
          return {valid : false, msg: key+" is not a correct name to sort the array '"+node.name+"'"};
        var test = index===0 || array[index - 1].value <= item.value;
        return utils.validate( test , "Array '"+node.name+"' is not sorted");
      });
    }
  };

  MIN.validate = function(node){
    var min = node[this.name];
    return utils.testScalarOrArray(node.value, function(value){
      return utils.validate( min <= value,  value+" is below the min value: "+min);
    });
  };

  MAX.validate = function(node){
    var max = node[this.name];
    return utils.testScalarOrArray(node.value, function(value){
      return utils.validate( max >= value , value+" is above the max value: "+max);
    });
  };

  MINSIZE.validate  = function(node){ // Either work on value or on children
    var array = node.value || node.children;
    var min = node[this.name];
    return utils.validate( min <= array.length, "array has too few elements ("+ array.length+")");
  };

  MAXSIZE.validate  = function(node){ // Either work on value or on children
    var array = node.value || node.children;
    var max = node[this.name];
    return utils.validate( max >= array.length, "array has too many elements ("+ array.length+")");
  };

  MINLENGTH.validate = function(node){
    var min = node[this.name];
    return utils.testScalarOrArray(node.value, function(value){
      return utils.validate( min <= value.length, value+" is shorter than the min length: "+min);
    });
  };

  MAXLENGTH.validate = function(node){
    var max = node[this.name];
    return utils.testScalarOrArray(node.value, function(value){
      return utils.validate( max >= value.length, value+" is longer than the max length: "+max);
    });
  };


  //==============================================================================
  // TYPES

  var
  STRING = new Type("string", false,             [TAG, VIEWS, REQUIRED, REGEXP, MINLENGTH, MAXLENGTH]),
  REAL = new Type("real", false,                 [TAG, VIEWS, REQUIRED, MIN, MAX]),
  INT = new Type("int", false,                   [TAG, VIEWS, REQUIRED, MIN, MAX]),
  BOOLEAN = new Type("boolean", false,           [TAG, VIEWS, REQUIRED]),
  ARRAY_REAL = new Type("array-real", false,     [TAG, VIEWS, REQUIRED, MIN, MAX, MINSIZE, MAXSIZE]),
  ARRAY_INT = new Type("array-int", false,       [TAG, VIEWS, REQUIRED, MIN, MAX, MINSIZE, MAXSIZE]),
  ARRAY_STRING = new Type("array-string", false, [TAG, VIEWS, REQUIRED, REGEXP, MINLENGTH, MAXLENGTH, ORDERED, MINSIZE, MAXSIZE]),
  DATE = new Type("date", false,                 [TAG, VIEWS, REQUIRED]),
  ARRAY = new Type("array", true,                [TAG, VIEWS, REQUIRED, ORDERED, MINSIZE, MAXSIZE]),
  OBJECT = new Type("object", true,              [TAG, VIEWS, REQUIRED]);


  // PARSERS

  REAL.parseValue = utils.parseNumber;

  INT.parseValue = utils.parseInteger;

  STRING.parseValue = function(text){
    return text;
  };

  BOOLEAN.parseValue = function(text){
    return text.toLowerCase()==='true';
  };

  ARRAY_REAL.parseValue = function(text){
    return text.split(/\s+/g).map(utils.parseNumber);
  };

  ARRAY_INT.parseValue = function(text){
    return text.split(/\s+/g).map(utils.parseInteger);
  };

  ARRAY_STRING.parseValue = utils.parseSeparatedString;

  DATE.parseValue = function(text){
    var date = new Date(text);
    if(!isFinite(date)){
      throw new utils.Exception("Invalid date: "+text);
    }
    return date;
  };

  ARRAY.parseValue = function(text){
    throw new utils.Exception("Array is a container for other objects: do not insert text directly!");
  };

  OBJECT.parseValue = function(text){
    throw new utils.Exception("Object is a container for other objects: do not insert text directly!");
  };


  // VALIDATORS

  REAL.validateNode = function(node){
    var res = Type.prototype.validateNode.call(this,node);
    res.unshift( utils.validateType(node, "number"));
    return res;
  };

  INT.validateNode = function(node){
    var res = Type.prototype.validateNode.call(this,node);
    res.unshift( utils.validateType(node, "number"));
    return res;
  };

  STRING.validateNode = function(node){
    var res = Type.prototype.validateNode.call(this,node);
    res.unshift( utils.validateType(node, "string"));
    return res;
  };

  BOOLEAN.validateNode = function(node){
    var res = Type.prototype.validateNode.call(this,node);
    res.unshift( utils.validateType(node, "boolean"));
    return res;
  };

  ARRAY_REAL.validateNode = function(node){
    var res = Type.prototype.validateNode.call(this,node);
    res.unshift( utils.validate(Array.isArray(node.value), node.value+" is not an array !"));
    // TODO: check the type of each element
    return res;
  };

  ARRAY_INT.validateNode = function(node){
    var res = Type.prototype.validateNode.call(this,node);
    res.unshift( utils.validate(Array.isArray(node.value), node.value+" is not an array !"));
    // TODO: check the type of each element
    return res;
  };

  ARRAY_STRING.validateNode = function(node){
    var res = Type.prototype.validateNode.call(this,node);
    res.unshift( utils.validate(Array.isArray(node.value), node.value+" is not an array !"));
    // TODO: check the type of each element
    return res;
  };

  DATE.validateNode = function(node){
    var res = Type.prototype.validateNode.call(this,node);
    res.unshift( utils.validate(node.value instanceof Date, node.value+" is not a date !"));
    return res;
  };

  ARRAY.validateNode = function(node){
    var res = Type.prototype.validateNode.call(this,node);
    res.unshift( utils.validate(Array.isArray(node.children), node.value+" is not an array !"));
    return res;
  };

  OBJECT.validateNode = function(node){
    return Type.prototype.validateNode.call(this,node);
  };

  return {

      // GETTERS

      getDefaultTypes: function(){

        var types = {};
        types["real"] = REAL;
        types["int"] = INT;
        types["string"] = STRING;
        types["boolean"] = BOOLEAN;
        types["array-real"] = ARRAY_REAL;
        types["array-int"] = ARRAY_INT;
        types["array-string"] = ARRAY_STRING;
        types["date"] = DATE;
        types["array"] = ARRAY;
        types["object"] = OBJECT;
        return types;

      },


      getDefaultAttributes: function(){

        var attr = {};
        attr[TAG.name] = TAG;
        attr[VIEWS.name] = VIEWS;
        attr[REQUIRED.name] = REQUIRED;
        attr[REGEXP.name] = REGEXP;
        attr[ORDERED.name] = ORDERED;
        attr[MIN.name] = MIN;
        attr[MAX.name] = MAX;
        attr[MINSIZE.name] = MINSIZE;
        attr[MAXSIZE.name] = MAXSIZE;
        attr[MINLENGTH.name] = MINLENGTH;
        attr[MAXLENGTH.name] = MAXLENGTH;
        return attr;

      },


      getGenericType: function(type) {
        return new Type(type, false, [TAG]);
      },

      Type: Type,
      Attribute: Attribute,
      ILLEGAL_ATTR: ILLEGAL_ATTR

  };


}]);


/*
var types = exports.getDefaultTypes();
var func = types["array-string"].parseValue;
console.log(func("test \"toto\" 'plouf  caca' yay"));

func = types["date"].parseValue;
console.log(func("2015-05-10 16:45:02"));
console.log(func("10/05/2015 10:00"));*/
//console.log(func("10/05/2015 1pm"));
