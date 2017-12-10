// CS 174a Project 3 Ray Tracer Skeleton

function Ball( )
{                                 // *** Notice these data members. Upon construction, a Ball first fills them in with arguments:
  var members = [ "position", "size", "color", "k_a", "k_d", "k_s", "n", "k_r", "k_refract", "refract_index" ];
  for( i in arguments )    this[ members[ i ] ] = arguments[ i ];
  this.construct();
}

Ball.prototype.construct = function()
{
  // TODO:  Give Ball any other data members that might be useful, assigning them according to this Ball's this.position and this.size members.
  this.model_transform = mult(mat4(), translation(this.position));
  this.model_transform = mult(this.model_transform, scale(this.size, this.size, this.size));

  this.inverse_transform = inverse(this.model_transform);
  this.inverse_transform_transpose = transpose(this.inverse_transform);
}

Ball.prototype.intersect = function( ray, existing_intersection, minimum_dist )
{
  // TODO:  Given a ray, check if this Ball is in its path.  Recieves as an argument a record of the nearest intersection found 
  //        so far, updates it if needed and returns it.  Only counts intersections that are at least a given distance ahead along the ray.
  //        An interection object is assumed to store a Ball pointer, a t distance value along the ray, and a normal.

  //find t on the transformed ray, then plug value into the untransformed ray

  var inverse_ray_origin = mult_vec(this.inverse_transform, ray.origin).slice(0,3),
  	  inverse_ray = mult_vec(this.inverse_transform, ray.dir).slice(0,3);

//formula for intersection requires these components
  var s2 = dot(inverse_ray_origin, inverse_ray_origin),
  	  c2 = dot(inverse_ray, inverse_ray),
  	  sc = dot(inverse_ray_origin, inverse_ray);

  var disc = Math.pow(sc, 2) - c2 * (s2 - 1);

//if we have only imaginary solutions
  if (disc < 0)
  	return existing_intersection;

  var res1 = -sc / c2;
  var ans1, ans2, res;

  if (disc == 0)
  	var res = res1;
  //if we have two solutions, find the closest one that is not behind the camera
  else {
  	ans1 = res1 - Math.sqrt(disc, 2) / c2;
  	res = ans1;
  	if (ans1 < 0)
  		res = res1 + Math.sqrt(disc, 2) / c2;
  	if (res < 0)
  		return existing_intersection;
  }

  if (res <= minimum_dist) {
  	return existing_intersection;
  }

  //update the intersection object with the intersection data
  if (res < existing_intersection.distance)
  {
  	existing_intersection.inside = false;
  	if (res != ans1)
  		existing_intersection.inside = true;
    existing_intersection.distance = res;
    existing_intersection.ball = this;
	existing_intersection.normal = normalize(mult_vec(this.inverse_transform_transpose, add(inverse_ray_origin, scale_vec(res, inverse_ray))).slice(0,3));
    // console.log(existing_intersection.normal);
  }

  return existing_intersection;
}

var mult_3_coeffs = function( a, b ) { return [ a[0]*b[0], a[1]*b[1], a[2]*b[2] ]; };       // Convenient way to combine two color vectors

var background_functions = {                // These convert a ray into a color even when no balls were struck by the ray.
waves: function( ray, distance )
{
  return Color( .5 * Math.pow( Math.sin( 2 * ray.dir[0] ), 4 ) + Math.abs( .5 * Math.cos( 8 * ray.dir[0] + Math.sin( 10 * ray.dir[1] ) + Math.sin( 10 * ray.dir[2] ) ) ),
                .5 * Math.pow( Math.sin( 2 * ray.dir[1] ), 4 ) + Math.abs( .5 * Math.cos( 8 * ray.dir[1] + Math.sin( 10 * ray.dir[0] ) + Math.sin( 10 * ray.dir[2] ) ) ),
                .5 * Math.pow( Math.sin( 2 * ray.dir[2] ), 4 ) + Math.abs( .5 * Math.cos( 8 * ray.dir[2] + Math.sin( 10 * ray.dir[1] ) + Math.sin( 10 * ray.dir[0] ) ) ), 1 );
},
lasers: function( ray, distance ) 
{
  var u = Math.acos( ray.dir[0] ), v = Math.atan2( ray.dir[1], ray.dir[2] );
  return Color( 1 + .5 * Math.cos( Math.floor( 20 * u ) ), 1 + .5 * Math.cos( Math.floor( 20 * v ) ), 1 + .5 * Math.cos( Math.floor( 8 * u ) ), 1 );
},
mixture:       function( ray, distance ) { return mult_3_coeffs( background_functions["waves"]( ray, distance ), background_functions["lasers"]( ray, distance ) ).concat(1); },
ray_direction: function( ray, distance ) { return Color( Math.abs( ray.dir[ 0 ] ), Math.abs( ray.dir[ 1 ] ), Math.abs( ray.dir[ 2 ] ), 1 );  },
color:         function( ray, distance ) { return background_color;  }
};
var curr_background_function = "color";
var background_color = vec4( 0, 0, 0, 1 );

// *******************************************************
// Raytracer class - gets registered to the window by the Animation object that owns it
function Raytracer( parent )  
{
  var defaults = { width: 32, height: 32, near: 1, left: -1, right: 1, bottom: -1, top: 1, scanline: 0, visible: true, anim: parent, ambient: vec3( .1, .1, .1 ) };
  for( i in defaults )  this[ i ] = defaults[ i ];
  
  this.m_square = new N_Polygon( 4 );                   // For texturing with and showing the ray traced result
  this.m_sphere = new Subdivision_Sphere( 4, true );    // For drawing with ray tracing turned off
  
  this.balls = [];    // Array for all the balls
    
  initTexture( "procedural", true, true );      // Our texture for drawing the ray trace    
  textures["procedural"].image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"   // Blank gif file
  
  this.scratchpad = document.createElement('canvas');   // A hidden canvas for assembling the texture
  this.scratchpad.width  = this.width;
  this.scratchpad.height = this.height;
  
  this.scratchpad_context = this.scratchpad.getContext('2d');
  this.imageData          = new ImageData( this.width, this.height );     // Will hold ray traced pixels waiting to be stored in the texture
  
  this.make_menu();
}

Raytracer.prototype.toggle_visible = function() { this.visible = !this.visible; document.getElementById("progress").style = "display:inline-block;" };

Raytracer.prototype.make_menu = function()      // The buttons
{
  document.getElementById( "raytracer_menu" ).innerHTML = "<span style='white-space: nowrap'><button id='toggle_raytracing' class='dropbtn' style='background-color: #AF4C50'>Toggle Ray Tracing</button> \
                                                           <button onclick='document.getElementById(\"myDropdown2\").classList.toggle(\"show\"); return false;' class='dropbtn' style='background-color: #8A8A4C'>Select Background Effect</button><div id='myDropdown2' class='dropdown-content'>  </div>\
                                                           <button onclick='document.getElementById(\"myDropdown\").classList.toggle(\"show\"); return false;' class='dropbtn' style='background-color: #4C50AF'>Select Test Case</button><div id='myDropdown' class='dropdown-content'>  </div> \
                                                           <button id='submit_scene' class='dropbtn'>Submit Scene Textbox</button> \
                                                           <div id='progress' style = 'display:none;' ></div></span>";
  for( i in test_cases )
  {
    var a = document.createElement( "a" );
    a.addEventListener("click", ( function( i, self ) { return function() { load_case( i ); self.parseFile(); }; } )( i, this ), false);
    a.innerHTML = i;
    document.getElementById( "myDropdown" ).appendChild( a );
  }
  for( j in background_functions )
  {
    var a = document.createElement( "a" );
    a.addEventListener("click", ( function( j ) { return function() { curr_background_function = j; } } )( j ), false);
    a.innerHTML = j;
    document.getElementById( "myDropdown2" ).appendChild( a );
  }
  
  document.getElementById( "input_scene" ).addEventListener( "keydown", function(event) { event.cancelBubble = true; }, false );
  
  window.addEventListener( "click", function(event) {  if (!event.target.matches('.dropbtn')) {    
  document.getElementById( "myDropdown"  ).classList.remove("show");
  document.getElementById( "myDropdown2" ).classList.remove("show"); } }, false );

  document.getElementById( "toggle_raytracing" ).addEventListener("click", this.toggle_visible.bind( this ), false);
  document.getElementById( "submit_scene" ).addEventListener("click", this.parseFile.bind( this ), false);
}

Raytracer.prototype.getDir = function( ix, iy ) {
  
  // TODO:  Maps an (x,y) pixel to a corresponding xyz vector that reaches the near plane.  This function, once finished,
  //        will help cause everything under the "background functions" menu to start working. 
  
  	// var x = ix/this.width,
  	// 	y = iy/this.height;
    //return vec4( this.left * (1 - x) + this.right * x, -this.top * (1 - y) - this.bottom * y, -this.near, 0 );
    //why do I have to put - -this.left here?

    return vec3( (this.right - this.left) * ix/this.width + 1 * this.left, -(this.bottom - this.top) * iy/this.height - this.top, -this.near).concat(0);
}
  
Raytracer.prototype.trace = function( ray, color_remaining, shadow_test_light_source )
{
  // TODO:  Given a ray, return the color in that ray's path.  Could be originating from the camera itself or from a secondary reflection 
  //        or refraction off a ball.  Call Ball.prototype.intersect on each ball to determine the nearest ball struck, if any, and perform
  //        vector math (namely the Phong reflection formula) using the resulting intersection record to figure out the influence of light on 
  //        that spot.  
  //
  //        Arguments include some indicator of recursion level so you can cut it off after a few recursions.  Or, optionally,
  //        instead just store color_remaining, the pixel's remaining potential to be lit up more... proceeding only if that's still significant.  
  //        If a light source for shadow testing is provided as the optional final argument, this function's objective simplifies to just 
  //        checking the path directly to a light source for obstructions.
  
  if( length( color_remaining.color ) < .3 )    return Color( 0, 0, 0, 1 );  // Is there any remaining potential for brightening this pixel even more?

  var closest_intersection = { distance: Number.POSITIVE_INFINITY, inside: false }    // An empty intersection object
  
  //test for closest intersection 
  for (var i = 0; i < this.balls.length; i++)
  {
  	if (color_remaining.level == 0) 
  		this.balls[i].intersect(ray, closest_intersection, 1.00001);
  	else
  		this.balls[i].intersect(ray, closest_intersection, 0.00001);  
  }
  if (closest_intersection.inside) {
  	closest_intersection.normal = negate(closest_intersection.normal);
  	// console.log("inside");
  }

  // console.log(shadow_test_light_source);
  //if we are creating shadows only return black or light source color
  if (shadow_test_light_source) {
  	// console.log(closest_intersection.distance);
  	if (closest_intersection.distance >= 0 && closest_intersection.distance <= 1) {
	// if (closest_intersection.distance != Number.POSITIVE_INFINITY) {
		// return shadow_test_light_source.color;
  		return Color( 0, 0, 0, 1 );
  	}
  	else {
		return shadow_test_light_source.color;
  		// return Color( 0, 0, 0, 1 );
  	}
  }


  if( !closest_intersection.ball )
    return mult_3_coeffs( this.ambient, background_functions[ curr_background_function ] ( ray ) ).concat(1);  
  else
  {

  	//reflected ray from the incident ray
  	var reflectedRay = { origin: add(ray.origin, scale_vec(closest_intersection.distance, ray.dir)), 
  						 dir: add(scale_vec(-2 * dot(closest_intersection.normal.slice(0,3), ray.dir.slice(0,3)), closest_intersection.normal.slice(0,3)), ray.dir.slice(0,3)).concat(0) };

  	//calculate ambient color
  	var ambient_color =  scale_vec(closest_intersection.ball.k_a, closest_intersection.ball.color).concat(1);  
  	var diffuse_color = Color(0, 0, 0, 1);
  	var specular_color = Color(0, 0, 0, 1);
  	for (var j = 0; j < this.anim.graphicsState.lights.length; j++)
  	{
	  	var L = { origin: reflectedRay.origin, 
				  dir: normalize(subtract(this.anim.graphicsState.lights[j].position, reflectedRay.origin).slice(0, 3)).concat(0) };
				  //l unnormalized is for use with reflections
	  	var L_unNormalized = { origin: reflectedRay.origin, 
				  dir: subtract(this.anim.graphicsState.lights[j].position, reflectedRay.origin) };  
		//calculations for the diffuse color
  		var NL = dot(closest_intersection.normal, L.dir.slice(0,3));
  		var recur_obj = {color: vec3(1,1,1),
  						 level : color_remaining.level + 1};
  		var traceCol = this.trace(L_unNormalized, recur_obj, this.anim.graphicsState.lights[j]).slice(0,3);
  		var diff = mult_3_coeffs(traceCol, closest_intersection.ball.color);
  		var vecc = scale_vec(Math.max(0, NL) * closest_intersection.ball.k_d, diff).concat(0);
  		//add diffuse color to the total color
  		diffuse_color = add(diffuse_color, vecc);

   		//possibly too jank to be the solution
   		if (length(traceCol) == 0)
   			continue;

   		//light color SHOULD effect both specular and diffuse, unlike what the spec says
   		//calculations for specular color
   		var R = { origin: reflectedRay.origin, 
				  dir: normalize(add(scale_vec(-2 * dot(closest_intersection.normal.slice(0,3), negate(L.dir.slice(0,3))), closest_intersection.normal), negate(L.dir.slice(0,3)))).concat(0) };
		var V = normalize(negate(ray.dir.slice(0,3)));
		var spec_coeff = closest_intersection.ball.k_s * Math.pow(Math.max(0, dot(R.dir.slice(0,3), V)), closest_intersection.ball.n);
		var specCol = scale_vec(spec_coeff, this.anim.graphicsState.lights[j].color);
		//add specular color to the total color
		specular_color = add(specular_color, specCol);
  	}
  	diffuse_color[3] = 1;
  	specular_color[3] = 1;

  	for (var k = 0; k < 3; k++)
  	{
  		//clamp all color values to 1
  		ambient_color[k] = Math.min(1, ambient_color[k]);
  		specular_color[k] = Math.min(1, specular_color[k]);
  		diffuse_color[k] = Math.min(1, diffuse_color[k]);
  	}

  	//calculate color remaining to limit the recursion
  	var total_color = add(add(ambient_color, diffuse_color), specular_color);
  	color_remaining.color = subtract(color_remaining.color, vec3(Math.min(1, total_color[0]), Math.min(1, total_color[1]), Math.min(1, total_color[2])));
  	color_remaining.level++;
  	//recursively call trace on the reflected ray
  	var reflected_color = scale_vec(closest_intersection.ball.k_r, this.trace(reflectedRay, color_remaining));

	color_remaining.color = subtract(color_remaining.color, reflected_color.slice(0,3));

  	var ref_rec_obj = color_remaining;
  	ref_rec_obj.curr_n = closest_intersection.ball.refract_index;

  	var idn = dot(negate(ray.dir.slice(0,3)), closest_intersection.normal);
  	var n1dn2 = color_remaining.curr_n / closest_intersection.ball.refract_index;
  	console.log(n1dn2);
  	// console.log(closest_intersection.ball.refract_index);

//try to raycast the refracted ray, isnt working
  	if (Math.acos(idn) < Math.asin(1/n1dn2) && n1dn2 > 1){
  		console.log("here");
	  	var refracted_ray = add(scale_vec(n1dn2, ray.dir.slice(0,3)), scale_vec(n1dn2 * idn - Math.sqrt(1 - Math.pow(n1dn2, 2) * (1 - Math.pow(idn, 2))), closest_intersection.normal.slice(0,3)));
	  	var refRay = { origin: reflectedRay.origin, 
					   dir: normalize(refracted_ray).concat(0) };

		var refracted_color = scale_vec(closest_intersection.k_refract, this.trace(refRay, ref_rec_obj));
	}

  	// console.log(reflected_color);
  	// return total_color;
  	// return add(total_color, add(reflected_color, refracted_color));
  	// console.log(refracted_color);
  	//didnt add refraction becuase it wasnt working
  	return add(total_color, reflected_color);
  }
}

Raytracer.prototype.parseLine = function( tokens )            // Load the text lines into variables
{
  switch( tokens[0] )
    {
        case "NEAR":    this.near   = tokens[1];  break;
        case "LEFT":    this.left   = tokens[1];  break;
        case "RIGHT":   this.right  = tokens[1];  break;
        case "BOTTOM":  this.bottom = tokens[1];  break;
        case "TOP":     this.top    = tokens[1];  break;
        case "RES":     this.width  = tokens[1];  
                        this.height = tokens[2]; 
                        this.scratchpad.width  = this.width;
                        this.scratchpad.height = this.height; 
                        break;
        case "SPHERE":
          this.balls.push( new Ball( vec3( tokens[1], tokens[2], tokens[3] ), vec3( tokens[4], tokens[5], tokens[6] ), vec3( tokens[7], tokens[8], tokens[9] ), 
                             tokens[10], tokens[11], tokens[12], tokens[13], tokens[14], tokens[15], tokens[16] ) );
          break;
        case "LIGHT":
          this.anim.graphicsState.lights.push( new Light( vec4( tokens[1], tokens[2], tokens[3], 1 ), Color( tokens[4], tokens[5], tokens[6], 1 ), 100000 ) );
          break;
        case "BACK":     background_color = Color( tokens[1], tokens[2], tokens[3], 1 );  gl.clearColor.apply( gl, background_color ); break;
        case "AMBIENT":
          this.ambient = vec3( tokens[1], tokens[2], tokens[3] );    
          // console.log(this.left, this.right, this.near);      
    }
}

Raytracer.prototype.parseFile = function()        // Move through the text lines
{
  this.balls = [];   this.anim.graphicsState.lights = [];
  this.scanline = 0; this.scanlines_per_frame = 1;                            // Begin at bottom scanline, forget the last image's speedup factor
  document.getElementById("progress").style = "display:inline-block;";        // Re-show progress bar
  this.anim.graphicsState.camera_transform = mat4();                          // Reset camera
  var input_lines = document.getElementById( "input_scene" ).value.split("\n");
  for( var i = 0; i < input_lines.length; i++ ) this.parseLine( input_lines[i].split(/\s+/) );
}

Raytracer.prototype.setColor = function( ix, iy, color )        // Sends a color to one pixel value of our final result
{
  var index = iy * this.width + ix;
  this.imageData.data[ 4 * index     ] = 255.9 * color[0];    
  this.imageData.data[ 4 * index + 1 ] = 255.9 * color[1];    
  this.imageData.data[ 4 * index + 2 ] = 255.9 * color[2];    
  this.imageData.data[ 4 * index + 3 ] = 255;  
}

Raytracer.prototype.display = function(time)
{
  var desired_milliseconds_per_frame = 100;
  if( ! this.prev_time ) this.prev_time = 0;
  if( ! this.scanlines_per_frame ) this.scanlines_per_frame = 1;
  this.milliseconds_per_scanline = Math.max( ( time - this.prev_time ) / this.scanlines_per_frame, 1 );
  this.prev_time = time;
  this.scanlines_per_frame = desired_milliseconds_per_frame / this.milliseconds_per_scanline + 1;
  
  if( !this.visible )  {                         // Raster mode, to draw the same shapes out of triangles when you don't want to trace rays
    for( i in this.balls )
        this.m_sphere.draw( this.anim.graphicsState, this.balls[i].model_transform, new Material( this.balls[i].color.concat( 1 ), 
                                                                              this.balls[i].k_a, this.balls[i].k_d, this.balls[i].k_s, this.balls[i].n ) );
    this.scanline = 0;    document.getElementById("progress").style = "display:none";     return; }; 
  if( !textures["procedural"] || ! textures["procedural"].loaded ) return;      // Don't display until we've got our first procedural image
  
  this.scratchpad_context.drawImage(textures["procedural"].image, 0, 0 );
  this.imageData = this.scratchpad_context.getImageData(0, 0, this.width, this.height );    // Send the newest pixels over to the texture
  var camera_inv = inverse( this.anim.graphicsState.camera_transform );
   
  for( var i = 0; i < this.scanlines_per_frame; i++ )     // Update as many scanlines on the picture at once as we can, based on previous frame's speed
  {
    var y = this.scanline++;
    if( y >= this.height ) { this.scanline = 0; document.getElementById("progress").style = "display:none" };
    document.getElementById("progress").innerHTML = "Rendering ( " + 100 * y / this.height + "% )..."; 
    for ( var x = 0; x < this.width; x++ )
    {
      var ray = { origin: mult_vec( camera_inv, vec4( 0, 0, 0, 1 ) ), dir: mult_vec( camera_inv, this.getDir( x, y ) ) };   // Apply camera
      var recur_obj = {color:vec3(1,1,1),
      				   level: 0,
      				   curr_n: 1};
      this.setColor( x, y, this.trace( ray, recur_obj ) );                                    // ******** Trace a single ray *********
    }
  }
  
  this.scratchpad_context.putImageData( this.imageData, 0, 0);                    // Draw the image on the hidden canvas
  textures["procedural"].image.src = this.scratchpad.toDataURL("image/png");      // Convert the canvas back into an image and send to a texture
  
  this.m_square.draw( new GraphicsState( mat4(), mat4(), 0 ), mat4(), new Material( Color( 0, 0, 0, 1 ), 1,  0, 0, 1, "procedural" ) );

  if( !this.m_text  ) { this.m_text  = new Text_Line( 45 ); this.m_text .set_string("Open some test cases with the blue button."); }
  if( !this.m_text2 ) { this.m_text2 = new Text_Line( 45 ); this.m_text2.set_string("Click and drag to steer."); }
  
  var model_transform = rotation( -90, vec3( 0, 1, 0 ) );                           
      model_transform = mult( model_transform, translation( .3, .9, .9 ) );
      model_transform = mult( model_transform, scale( 1, .075, .05) );
  
  this.m_text .draw( new GraphicsState( mat4(), mat4(), 0 ), model_transform, true, vec4(0,0,0, 1 - time/10000 ) );         
      model_transform = mult( model_transform, translation( 0, -1, 0 ) );
  this.m_text2.draw( new GraphicsState( mat4(), mat4(), 0 ), model_transform, true, vec4(0,0,0, 1 - time/10000 ) );   
}

Raytracer.prototype.init_keys = function()   {  shortcut.add( "SHIFT+r", this.toggle_visible.bind( this ) );  }

Raytracer.prototype.update_strings = function( debug_screen_object )    // Strings that this displayable object (Raytracer) contributes to the UI:
  { }