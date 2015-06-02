
app.factory('xml-parser',['utils','views','default-types',function(utils, views, tyleTypes){

  var types = tyleTypes.getDefaultTypes();
  // TODO: Feature to enable importing type files;


  // Parser constants:
  var STATE_IDLE=0, STATE_TYLE=1, STATE_SCHEMAS=2, STATE_VIEWS=3, STATE_TYLES=4 ;
  var TYLE = 'tyle', SCHEMAS = 'schemas', VIEWS = 'views', TYLES = "tyles" ;

  // Parser settings:
  var strict = true; // set to false for html-mode
  var options = {trim: true, normalize : true, position:true};



  // Parser definition:
  return function(log, callback) {

    log.info('@getParser');

    var parser = sax.parser(strict, options);
    //var streamParser = sax.createStream(strict, options);
    var killed = false;

    var tylefile, state = STATE_IDLE, stack = [], stack2 = [];

    parser.onopentag = onOpenedtag;
    parser.onclosetag = onClosedTag;
    parser.ontext = onText;
    parser.onend = onEnd;
    parser.onerror = onError;

    return parser;


    // PARSER FUNCTIONS:

    function onOpenedtag(node) {
      if(killed) return;
      // same object as above
      log.info("@opentag: new node '"+node.name+"' [State:"+state+"]");
      //inspector(node);

      //delete node.isSelfClosing;

      switch(state){

        case STATE_IDLE:
          if(node.name.toLowerCase() !== TYLE)
            logError("Expected node '"+TYLE+"' but found '"+node.name+"'", true);
          else {
            log.info("@opentag: parsing tyle node");
            checkNoAttribute(node);
            state = STATE_TYLE;
            tylefile = { schemas : [], views : [], tyles : [] };  // Initializing data structure
          }
          break;


        case STATE_TYLE:
          switch(node.name.toLowerCase()){
            case SCHEMAS:
              log.info("@opentag: parsing schemas node");
              state = STATE_SCHEMAS;
              parseSchemasAttributes(node.attributes);
              break;

            case VIEWS:
              log.info("@opentag: parsing views node"); // Brand new object
              state = STATE_VIEWS;
              parseViewsAttributes(node.attributes);
              break;

            case TYLES:
              log.info("@opentag: parsing tyles node");
              state = STATE_TYLES;
              checkNoAttribute(node);
              break;

            default:
              logError("Expected node '"+SCHEMAS+"' or '"+VIEWS+"' or '"+TYLES+"' but found '"+node.name+"'", true);
          }
          break;


        case STATE_SCHEMAS:
          parseSchema(node);
          addNodeTo(tylefile.schemas, node);
          break;


        case STATE_VIEWS:
          parseView(node);
          addNodeTo( tylefile.views, node );
          break;


        case STATE_TYLES:
          parseTyle(node);
          addNodeTo(tylefile.tyles, node);
          break;

        default:
          logError("Illegal state '"+state+"'", true);

      }

    }
    // END opentag


    function onClosedTag() {
      if(killed) return;

      var node = parser.tag;
      log.info("@closedtag: Closing node '"+node.name+"' [State:"+state+"]");

      delete node.isSelfClosing;
      if(node.attributes && Object.getOwnPropertyNames(node.attributes).length === 0)
        delete node.attributes;

      switch(state){

        case STATE_TYLE:
          state = STATE_IDLE;
          log.info("@closedtag: Closing tyle node");
          break;

        case STATE_SCHEMAS:
          closeNode(node.name, SCHEMAS);
          break;

        case STATE_VIEWS:
          closeNode(node.name, VIEWS);
          break;

        case STATE_TYLES:
          closeNode(node.name, TYLES);
          if(node.name!==TYLES)
            validateNode(node);
          break;

        case STATE_IDLE:
        default:
          logError("@closedtag: Illegal state!", false);

      }

    }
    // END closetag


    function onText(text) {
      if(killed) return;
      if( state !== STATE_TYLES )
        logError("Unexpected text out of tyles node", false);
      else{
        var node = stack[stack.length-1];
        if(node.children)
          logError("Node '"+node.name+"' should not have both children and values", false);
        try{
          node.value = node.getType().parseValue(text);
        }catch(er){
          node.value = text;
          logError("Could not parse value '"+text+"': "+er.message, false);
        }
      }
    }
    // END text


    function onEnd() {
      if(killed) return;

      killed = true;

      views.addDefaultViews(tylefile.views);

      callback(null, tylefile);
    }
    // END end


    function onError(e) {
      if(killed) return;
      // unhandled errors will throw, since this is a proper node
      // event emitter.
      log.error(e);

      killed = true;

      callback(e, tylefile);
    }
    // END error


    // SUPPORT FUNCTIONS

    function addNodeTo(owner, node) {
      if(stack.length===0){             // It's a brand new object !
        owner.push( node );
        log.info("New "+node.name+" added");
      }else{                            // It's a children
        var parent = stack[stack.length-1];
        if( ! parent.children ){  // If the parent node doesn't already have a list of children
          if(parent.value)        // Normally a node has a value or children (branch or leaf)
            logError("Node '"+parent.name+"' should not have both children and values");
          parent.children = [];       // Creates an array for the children, if not already there
          parent.get = utils.get;     // Provides nodes with children with a nice utility method
        }
        parent.children.push( node ); // Nests the node in the hierachy
      }
      stack.push( node );           // Adds the node on the stack to keep track of hierachy
    }

    function closeNode(nodename, category){
      if(nodename===category){
        state = STATE_TYLE;
        log.info("Closing "+category+" node");
      }else{
        stack.pop();
        stack2.pop();   // Will do something only for tyle nodes, obviously
      }
    }


    function parseSchema(node) {

      // First, take care of the type !
      node.getType = utils.getGetter(getType(node.attributes.type || 'unknown'));
      delete node.attributes.type;

      // Then, parse the attributes
      parseAttributes(node.attributes, node.getType());

    }

    function parseView(node) {
      if(node.name !== "view"){
        logError("Expected view node", false);
      }else{
        node.getName = utils.getGetter(node.attributes.name);
        delete node.attributes.name;
        if(node.attributes.hasOwnProperty('require')){
          node.require = node.attributes.require;
          delete node.attributes.require;
        }
        if(node.attributes.hasOwnProperty('description')){
          node.description = node.attributes.description;
          delete node.attributes.description;
        }
      }
    }

    function parseTyle(node) {

      // To Get attributes from schema
      if(stack.length===0){ // Brand new tyle
        stack2 = [tylefile.schemas];  // Initiate the other stack, to look for schemas
        node.getViews = views.getViews;
      }
      var children = stack2[stack2.length-1];  // children is from the schema stack
      var notfound = children.every(function(child){
        if(child.name === node.name){         // If there is a schema node with the same name...
          node.getType = child.getType;              // Schema nodes always have a type, event if generic
          if(child.attributes)
            transferProperties(child.attributes, node); // Add the attributes of the schema node
          stack2.push(child.children || []);    // Push the children of the child
        }else
          return true;    // Stay in every()
      });

      if( notfound ){  // Node has no schema
        stack2.push([]);  // Push an empty array to keep the right number of objects on the stack
        node.getType = utils.getGetter(getType(node.attributes.type || 'unknown')); // Get the type object:

      }else if(node.attributes.type){   // Node has a schema (meaning it has a type, and transfered attributes)
        var newtype = getType(node.attributes.type);
        if(newtype !== node.getType())
          logError("Node type '"+node.attributes.type+"' is not in line with schema", yes);

      }

      delete node.attributes.type;

      // Process tyle's attributes (must be done in any case)
      parseAttributes(node.attributes, node.getType());
      transferProperties(node.attributes, node);
      delete node.attributes;

      if(stack.length===0){
        if(!node.views)
          node.views = [];
        if(!node.views.some(function(v){return v.path[0]==="tree";}))
          node.views.unshift({path: ["tree","tree"]}); // Add tree view by default if not already there
      }
    }


    function parseAttributes(attributes, type) {    // Parse attributes
      for (var attr in attributes) {
        if (attributes.hasOwnProperty(attr)) {
          var value = attributes[attr].trim();
          if(tyleTypes.ILLEGAL_ATTR.indexOf(attr) > -1) // Check for illegal names
            logError("Illegal attribute name '"+attr+"'", true);
          try{
            attributes[attr] = type.parseAttribute(attr, value);
          }catch(ex){
            logError("Could not parse attribute "+attr+": "+ex.message, true);
          }
        }
      }
    }


    function transferProperties(origin, dest){
      for (var p in origin) {
        if (origin.hasOwnProperty(p)) {
          dest[p] = origin[p];
        }
      }
    }


    function getType(type){
      if(types.hasOwnProperty(type))
        return types[type];
      else{
        logWarn("Unknown type: "+type);
        return tyleTypes.getGenericType(type);
      }
    }


    function validateNode(node){
      var res = node.getType().validateNode(node);
      for(var i=0; i<res.length; i++){
        if(!res[i].valid)
          logWarn("Could not validate node '"+node.name+"': "+res[i].msg);
      }
    }

    function parseSchemasAttributes(attr){
      // TODO: Parse schema includes (as attributes)
    }

    function parseViewsAttributes(attr){
      // TODO: Parse views includes (as attributes)
    }

    function checkNoAttribute(node){
      if(node.attributes && Object.getOwnPropertyNames(node.attributes).length > 0)
        logWarn(TYLES+" node should not have attributes (they will be ignored)");
    }

    function logError( errorMessage, terminate ){
      errorMessage +=  " at line "+(parser.line+1)+"!";
      log.error(errorMessage);
      //inspector(this._parser);
      if(terminate){
        // TODO: must stop the parser somehow
        killed = true;
        callback(errorMessage, tylefile);
      }
    }

    function logWarn( warnMessage ){
      warnMessage +=  " at line "+(parser.line+1)+"!";
      log.warn(warnMessage);
    }
  };


}]);
