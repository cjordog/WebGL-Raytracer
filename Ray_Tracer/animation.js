// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has 
// no meaningful scenes to draw - you will fill it in (at the bottom of the file) with all your shape drawing calls and any extra key / mouse controls.  

// Now go down to display() to see where the sample shapes you see drawn are coded, and where to fill in your own code.

"use strict"      // Selects strict javascript
var canvas, canvas_size, shaders, gl = null, g_addrs,          // Global variables
  thrust = vec3(),  origin = vec3( 0, 10, -15 ), looking = false, prev_time = 0, animate = false, animation_time = 0, gouraud = false, color_normals = false;

// *******************************************************
// IMPORTANT -- Any new variables you define in the shader programs need to be in the list below, so their GPU addresses get retrieved.

var shader_variable_names = [ "camera_transform", "camera_model_transform", "projection_camera_model_transform", "camera_model_transform_normal",
                              "shapeColor", "lightColor", "lightPosition", "attenuation_factor", "ambient", "diffusivity", "shininess", "smoothness", 
                              "animation_time", "COLOR_NORMALS", "GOURAUD", "USE_TEXTURE" ];
   
function Color( r, g, b, a ) { return [ r, g, b, a ]; }     // Colors are just special vec4s expressed as: ( red, green, blue, opacity )
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( Color( .8,.3,.8,1 ), .1, 1, 1, 40, undefined ) ); }

// *******************************************************
// IMPORTANT -- In the line below, add the filenames of any new images you want to include for textures!

var texture_filenames_to_load = [ "text.png" ];

window.onload = function init() { var anim = new Animation(); }   // Our whole program's entry point

// *******************************************************  
// When the web page's window loads it creates an "Animation" object.  It registers itself as a displayable object to our other class "GL_Context" -- 
// which OpenGL is told to call upon every time a draw / keyboard / mouse event happens.
function Animation()    // A class.  An example of a displayable object that our class GL_Context can manage.
{
  ( function init( self )
  {    
    self.context = new GL_Context( "gl-canvas", Color( 0, 0, 0, 1 ) );    // Set your background color here
    self.context.register_display_object( self );
    
    shaders = { "Default":     new Shader( "vertex-shader-id", "fragment-shader-id" ), 
                "Demo_Shader": new Shader( "vertex-shader-id", "demo-shader-id"     )  };
    
    for( var i = 0; i < texture_filenames_to_load.length; i++ )
      initTexture( texture_filenames_to_load[i], true );
    self.mouse = { "from_center": vec2() };
    self.m_axis        = new Axis();
    
// 1st parameter is our starting camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
    self.graphicsState = new GraphicsState( translation(0, 0,-25), perspective(90, canvas.width/canvas.height, 1, 1000), 0 );
    
    
    
    
    
    
    
    
    
    
    self.raytracer = new Raytracer( self );
    self.context.register_display_object( self.raytracer );           /******************** RAY TRACER **********************/
    
    
    
    
    
    
    
    
    
    
    
    
    self.context.render();  
  } ) ( this );
  
// *** Mouse controls: ***
  var mouse_position = function( e ) { return vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2 ); };   // Measure mouse steering, for rotating the flyaround camera.     
  canvas.addEventListener("mouseup",   ( function(self) { return function(e)  { e = e || window.event;    self.mouse.anchor = undefined;              } } ) (this), false );
  canvas.addEventListener("mousedown", ( function(self) { return function(e)  { e = e || window.event;    self.mouse.anchor = mouse_position(e);      } } ) (this), false );
  canvas.addEventListener("mousemove", ( function(self) { return function(e)  { e = e || window.event;    self.mouse.from_center = mouse_position(e); } } ) (this), false );                                         
  canvas.addEventListener("mouseout", ( function(self) { return function(e) { self.mouse.from_center = vec2(); }; } ) (this), false );        // Stop steering if the mouse leaves the canvas. 
}
  
// *******************************************************  
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
  shortcut.add( "Space", function() { thrust[1] = -1; } );      shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
  shortcut.add( "z",     function() { thrust[1] =  1; } );      shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
  shortcut.add( "w",     function() { thrust[2] =  1; } );      shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
  shortcut.add( "a",     function() { thrust[0] =  1; } );      shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
  shortcut.add( "s",     function() { thrust[2] = -1; } );      shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
  shortcut.add( "d",     function() { thrust[0] = -1; } );      shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
  shortcut.add( "f",     function() { looking = !looking; } );
  shortcut.add( ",",   ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform       ); } } ) (this) ) ;
  shortcut.add( ".",   ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform       ); } } ) (this) ) ;
  shortcut.add( "o",   ( function(self) { return function() { origin = mult_vec( inverse( self.graphicsState.camera_transform ), vec4(0,0,0,1) ).slice(0,3);                    } } ) (this) ) ;
  shortcut.add( "r",   ( function(self) { return function() { self.graphicsState.camera_transform = mat4(); }; } ) (this) );
  shortcut.add( "ALT+g", function() { gouraud = !gouraud; } );
  shortcut.add( "ALT+n", function() { color_normals = !color_normals; } );
  shortcut.add( "ALT+a", function() { animate = !animate; } );
  shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; }; } ) (this) );
  shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; }; } ) (this) ); 
}

Animation.prototype.update_strings = function( debug_screen_strings )       // Strings that this displayable object (Animation) contributes to the UI:  
{
  debug_screen_strings.string_map["time"]    = "Animation Time: " + this.graphicsState.animation_time/1000 + "s";
  debug_screen_strings.string_map["basis"]   = "Showing basis: " + this.m_axis.basis_selection;
  debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
  debug_screen_strings.string_map["thrust"]  = "Thrust: " + thrust;
}

function update_camera( self, animation_delta_time )
  {
    var leeway = 70,  degrees_per_frame = .0004 * animation_delta_time,
                      meters_per_frame  =   .01 * animation_delta_time;
                    
    if( self.mouse.anchor ) // Dragging mode: Is a mouse drag occurring?
    {
      var dragging_vector = subtract( self.mouse.from_center, self.mouse.anchor);           // Arcball camera: Spin the scene around the world origin on a user-determined axis.
      if( length( dragging_vector ) > 0 )
        self.graphicsState.camera_transform = mult( self.graphicsState.camera_transform,    // Post-multiply so we rotate the scene instead of the camera.
            mult( translation(origin),                                                      
            mult( rotation( .05 * length( dragging_vector ), dragging_vector[1], dragging_vector[0], 0 ), 
            translation(scale_vec( -1,origin ) ) ) ) );
    }    
          // Flyaround mode:  Determine camera rotation movement first
    var movement_plus  = [ self.mouse.from_center[0] + leeway, self.mouse.from_center[1] + leeway ];  // mouse_from_center[] is mouse position relative to canvas center;
    var movement_minus = [ self.mouse.from_center[0] - leeway, self.mouse.from_center[1] - leeway ];  // leeway is a tolerance from the center before it starts moving.
    
    for( var i = 0; looking && i < 2; i++ )     // Steer according to "mouse_from_center" vector, but don't start increasing until outside a leeway window from the center.
    {
      var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;  // Use movement's quantity unless the &&'s zero it out
      self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );     // On X step, rotate around Y axis, and vice versa.
    }
    self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );    // Now translation movement of camera, applied in local camera coordinate frame
  }

// *******************************************************  
// display(): Called once per frame, whenever OpenGL decides it's time to redraw.

Animation.prototype.display = function(time)
  {  
    if(!time) time = 0;                                                               // Animate shapes based upon how much measured real time has transpired
    this.animation_delta_time = time - prev_time;                                     // by using animation_time
    if( animate ) this.graphicsState.animation_time += this.animation_delta_time;
    prev_time = time;
    
    update_camera( this, this.animation_delta_time );
      
    shaders[ "Default" ].activate();                         // Keep the flags seen by the default shader program up-to-date
    gl.uniform1i( g_addrs.GOURAUD_loc, gouraud );   gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);    
    
    /**********************************/   
  }