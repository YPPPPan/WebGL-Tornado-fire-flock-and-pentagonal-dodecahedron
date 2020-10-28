//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// ORIGINAL SOURCE:
// RotatingTranslatedTriangle.js (c) 2012 matsuda
// HIGHLY MODIFIED to make:
//
// BouncyBall.js  for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin
//
//  06.SolveFloors:-------------------
//    --clearly label all global vars with 'g_' prefix: g_timeStep, etc.
//    --improve r/R keys for more intuitive usage; better on-screen user guide
//
//  07.StateVars:---------------------
//  a)--Make 'state variables' s1,s2 for just one 'bouncy-ball' particle.
//    The contents of these global float32Arrays completely describe the current 
//    and future state of our bouncy-ball, and will completely replace all 
//    of our existing bouncy-ball-describing variables:
//			xposPrev, yposPrev, zposPrev, ==> s1[0], s1[1], s1[2];   
//			xvelPrev, yvelPrev, zvelPrev, INIT_VEL ==> s1[3], s1[4], s1[5], s1[6].
//    Similarly, s2 holds the same values for the 'next' bouncy-ball state:
//			xposNow, yposNow, zposNow, ==> s2[0], s2[1], s2[2] 
//			xvelNow, yvelNow, zvelNow, INIT_VEL ==> s2[3], s2[4], s2[5], s2[6].
//  b)--One-by-one, comment-out & replace all old vars with these 'state vars'.
//     YUCK!! NO!! UGLY!!! WAIT WAIT!!!
//    Even this one simple 'bouncy-ball' particle has too many array indices to
//    remember!  DON'T use cryptic, error-prone numbers/literals; instead use
//    descriptive 'const' variable names listed below.  For example,
//    instead of s1[4] to replace the old 'yvelPrev', use s1[PART_YVEL].
//    instead of s2[3] to replace the old 'xvelNow',  use s2[PART_XVEL], etc.
//    Note how easily we can modify particle's definition:
//    we just add more array-index names.  As it's easy to do, lets extend our
//    particles to include adjustable parameters for color, mass, on-screen 
//    diameter, and even 'rendering mode' (selects our on-screen drawing mode;
//    should we draw the particle as a square? a circle? a sphere? etc.).
//    RESULT: we need 15 floating-point values to describe each particle.

//  08.StateFcns:---------------------
//  a) Delete all commented-out stuff we replaced with state variables. THEN:
//    Create a 'PartSys' object prototype (or JS class, if you prefer) to 
//     organize all particle-related code into particle-related functions. Start
//    by creating 'stub' functions described in Lecture Slides C, including:
//    --PartSys(count): constructor for 'empty' particle system with 'count' 
//      particles. 
//    --init(): creates all state variables, force-applying objects,
//      constraint-applying objects; all particle-system-related variables, and
//      set all of their initial values for interesting animated behaviors.
//      (eventually this will replace initVertexBuffers() function).
//    These next functions will help us simplify & shorten the 'draw()' fcn:  
//    --applyForces(s,F): clear the force-accumulator vector for each
//      particle in given state-vector 's', then apply each force described in
//      the collection of force-applying objects found in 'f'.  
//    --dotFinder(s): find the time-derivative of given state 's'.
//      (also simplifies 'draw()' function).
//    --render(s): draw the contents of state-vector 's' on-screen; first, 
//      transfer its contents to the already-existing VBO in the GPU using the
//      WebGL call 'gl.bufferSubData()', then draw it using gl.drawArray().
//    --solver(): find next state s2 from current state s1.
//    --doConstraint(): apply all constraints to s1 and s2.
//    --swap(): exchange contents of state-vector s1, s2.
//  b) Create global variable 'g_partA'; our first particle system object, using
//      our PartSys constructor.  UNIFY: replace all other global vars we use to
//      describe bouncy-ball particles with equivalent 'g_partA' properties. 
//      LATER: Move the set of const array-index names into PartSys, 
//                    so that we can customize them for each PartSys object.
//  c)--Fill the VBO with state var s1:  
//    MOVE all contents of initVertexBuffer() into g_partA.init() function,
//    (including, at first, the vertices[] array), along with the code in main()
//    that sets up attributes & uniforms. CAREFUL! you need to initialize s1
//    contents, esp. the position coord. 'w', diameter, mass, etc.
//    Then replace the 'vertices[]' array with s1[] state variable, AND be sure 
//    to adjust attribute stride & offset attribute a_Position to access values
//    correctly.  
//    Note that init() creates and fills the VBO with s1 contents, but does NOT 
//    make any further changes to the VBO's contents in the GPU; the s1 array 
//    holds the changing values of the changing particle state, but the VBO 
//    contents in the GPU does not change.  Instead, we loaded slightly-weird
//    s1 values into the VBO, and then uniform u_ballShift moves it on-screen.
// d) MOVE the bouncy-ball by modifying VBO contents:
//  At first, don't mess with the 'u_ballShift' uniform, and:
//  --at the end of our too-large 'draw()' function,add a 'bufferSubData()' call
//    that transfers current s1 contents to the VBO just before we draw it.  
//    This should DOUBLE the bouncy-ball movements, as it's moved by both 
//    the u_ballShift uniform and by s1 changes uploaded to VBO.

// e) Comment-out the u_ballShift uniform entirely -- from shaders, main(),etc.
//    SURPRISE!  Walls limit bouncy-ball to 0 <= x,y <= 1.8, but we draw bouncy
//    ball in the CVV(-1 <= x,y <= +1).  Change the wall limits to +/-0.9 in
//    in our gigantic 'draw()' function. Move the VBO-update-and-draw code to 
//    g_partA.render() function, and call it at the end of draw().
 
//--------------------------State-variable array-index constants----------------
const PART_XPOS     = 0;  //  position    
const PART_YPOS     = 1;
const PART_ZPOS     = 2;
const PART_WPOS     = 3;            // (why include w? for matrix transforms; 
                                    // for vector/point distinction
const PART_XVEL     = 4;  //  velocity.  This is ALWAYS a vector: x,y,z; no w. (w==0)    
const PART_YVEL     = 5;
const PART_ZVEL     = 6;
const PART_X_FTOT   = 7;  // force accumulator:'ApplyForces()' fcn clears
const PART_Y_FTOT   = 8;  // to zero, then adds each force to each particle.
const PART_Z_FTOT   = 9;        
const PART_R        =10;  // color : red,green,blue, alpha (opacity); 0<=RGBA<=1.0
const PART_G        =11;  
const PART_B        =12;
const PART_MASS     =13;  // mass   
const PART_DIAM 	  =14;	// on-screen diameter (in pixels)
const PART_RENDMODE =15;	// on-screen appearance (square, round, or soft-round)
/* // Other useful particle values, currently unused
const PART_AGE      =16;  // # of frame-times since creation/initialization
const PART_CHARGE   =17;  // for electrostatic repulsion/attraction
const PART_MASS_VEL =18;  // time-rate-of-change of mass.
const PART_MASS_FTOT=19;  // force-accumulator for mass-change
const PART_R_VEL    =20;  // time-rate-of-change of color:red
const PART_G_VEL    =21;  // time-rate-of-change of color:grn
const PART_B_VEL    =22;  // time-rate-of-change of color:blu
const PART_R_FTOT   =23;  // force-accumulator for color-change: red
const PART_G_FTOT   =24;  // force-accumulator for color-change: grn
const PART_B_FTOT   =25;  // force-accumulator for color-change: blu
*/
const PART_MAXVAR   =16;  // Size of array in CPart uses to store its values.
//------------------------------------------------------------------------------

/*==========================
  ==========================
  
  PARTICLE SYSTEM OBJECT prototype:
  (soon: move to a separate file 'PartSys.js')
  ==========================
  ==========================
*/
var cameraYX = 0;
var cameraYY = 0;
var cameraX = 0;
var cameraAngleX = 0;
var cameraAngleY = 0;
var gs_last = 0;
var counter = 0;
var separate_dis = 0.07;
var cohesion_dis = 1;
var alignment_dis = 0.8;
var separate_damping = 0.005;
var cohesion_damping = 0.02;
var alignment_damping = 0.015;
var sprint_damping = 10;
var sprint_length = 1.42729;
var sprint_length2 = 4.0;
var vertices = [[1.214124, 0.000000, 1.589309],
    [0.375185, 1.154701, 1.589309],
    [-0.982247, 0.713644, 1.589309],
    [-0.982247, -0.713644, 1.589309],
    [0.375185, -1.154701, 1.589309],
    [1.964494, 0.000000, 0.375185],
    [0.607062, 1.868345, 0.375185],
    [-1.589309, 1.154701, 0.375185],
    [-1.589309, -1.154701, 0.375185],
    [0.607062, -1.868345, 0.375185],
    [1.589309, 1.154701, -0.375185],
    [-0.607062, 1.868345, -0.375185],
    [-1.964494, 0.000000, -0.375185],
    [-0.607062, -1.868345, -0.375185],
    [1.589309, -1.154701, -0.375185],
    [0.982247, 0.713644, -1.589309],
    [-0.375185, 1.154701, -1.589309],
    [-1.214124, 0.000000, -1.589309],
    [-0.375185, -1.154701, -1.589309],
    [0.982247, -0.713644, -1.589309]];
var lines = [[1,4,5],
    [2,6],
    [3,7],
    [4,8],
    [9],
    [10,14],
    [10,11],
    [11,12],
    [12,13],
    [13,14],
    [15],
    [16],
    [17],
    [18],
    [19],
    [16,19],
    [17],
    [18],
    [19]];
var implicit_spring = [[17],
    [18],
    [19],
    [15],
    [16],
    [12],
    [13],
    [14],
    [10],
    [11]];
//=============================================================================
//=============================================================================
function PartSys(count) {
//==============================================================================
//=============================================================================
// Constructor for a new particle system.
  this.partCount = count;     // set the number of particles
  console.log(this.constructor.name + ' constructor called for: ' 
            + this.partCount + ' :particles.');
}

PartSys.prototype.init = function(sel) {
//==============================================================================
// Initializes everything in our particle system; creates all state variables, 
// force-applying objects, constraint-applying objects, etc.; sets initial
// values for all particle-system-related variables to create an interesting
// animated behavior selected by 'sel'.
//      (eventually this will replace initVertexBuffers() function).

  switch(sel) {   // Which particle system did user select?
    case 0:       // Set up a single-particle bouncy-ball system.
	  makeGroundGrid()
	  makeCylinder()
      this.s1 = new Float32Array((g_partA.partCount[0]+g_partA.partCount[1]+g_partA.partCount[2]+g_partA.partCount[3]) * PART_MAXVAR);
      this.s2 = new Float32Array((g_partA.partCount[0]+g_partA.partCount[1]+g_partA.partCount[2]+g_partA.partCount[3])  * PART_MAXVAR);
      this.sm = new Float32Array((g_partA.partCount[0]+g_partA.partCount[1]+g_partA.partCount[2]+g_partA.partCount[3])  * PART_MAXVAR);
            // NOTE: Float32Array objects are zero-filled by default.
      this.INIT_VEL =  40.0;		// initial velocity in meters/sec.
    	                  // adjust by ++Start, --Start buttons. Original value 
    										// was 0.15 meters per timestep; multiply by 60 to get
                        // meters per second.
      this.drag = 0.800;// units-free air-drag (scales velocity); adjust by d/D keys
      this.grav = 9.832;// gravity's acceleration; adjust by g/G keys
  		                  // on Earth surface: 9.832 meters/sec^2.
      this.resti = 1.0; // units-free 'Coefficient of restitution' for 
    	                  // inelastic collisions.  Sets the fraction of momentum 
    										// (0.0 <= resti < 1.0) that remains after a ball 
    										// 'bounces' on a wall or floor, as computed using 
    										// velocity perpendicular to the surface. 
    										// (Recall: momentum==mass*velocity.  If ball mass does 
    										// not change, and the ball bounces off the x==0 wall,
    										// its x velocity xvel will change to -xvel * resti ).
      //--------------------------Particle System Controls:
      this.runMode = 3;	// particle system state: 0=reset; 1= pause; 2=step; 3=run
      this.solvType = 0;// adjust by s/S keys.
  	                    // ==0 for Euler solver (explicit, forward-time, as 
  											// found in BouncyBall03 and BouncyBall04.goodMKS)
  											// ==1 for special-case implicit solver, reverse-time, 
  											// as found in BouncyBall03.01BAD, BouncyBall04.01badMKS)
      this.bounceType = 1;	// floor-bounce constraint type:
  											// ==0 for velocity-reversal, as in all previous versions
  											// ==1 for Chapter 3's collision resolution method, which
  											// uses an 'impulse' to cancel any velocity boost caused
  											// by falling below the floor.
  											
  //--------------------------------Create & fill VBO with state var s1 contents:
  // INITIALIZE s1, s2:
  //  NOTE: s1,s2 are a Float32Array objects, zero-filled by default.
  // That's OK for most particle parameters, but these need non-zero defaults:
      for(var i = 0; i < this.partCount[0]*PART_MAXVAR; i += PART_MAXVAR) {
        this.s1[i + PART_XPOS] = -0.5;      // lower-left corner of CVV
        this.s1[i + PART_YPOS] = -0.9;      // with a 0.1 margin
        this.s1[i + PART_ZPOS] =  0.0;
        this.s1[i + PART_WPOS] =  1.0;      // position 'w' coordinate;

        this.s1[i + PART_XVEL] =  i*this.INIT_VEL;
        this.s1[i + PART_YVEL] =  i*this.INIT_VEL;
        this.s1[i + PART_ZVEL] =  0.0;
		this.s1[i + PART_R] = 1.0;
		this.s1[i + PART_G] = 1.0;
		this.s1[i + PART_B] = 0.0;
		this.s1[i + PART_X_FTOT] = 0
		this.s1[i + PART_Y_FTOT] = 0
		this.s1[i + PART_Z_FTOT] = -this.grav

        this.s1[i + PART_MASS] =  1.0;      // mass, in kg.
        this.s1[i + PART_DIAM] =  9.0;      // on-screen diameter, in pixels
        //----------------------------
        this.s2[i + PART_XPOS] = -0.5;      // lower-left corner of CVV
        this.s2[i + PART_YPOS] = -0.9;      // with a 0.1 margin
        this.s2[i + PART_ZPOS] =  0.0;
        this.s2[i + PART_WPOS] =  1.0;      // position 'w' coordinate;

        this.s2[i + PART_XVEL] =  0;
        this.s2[i + PART_YVEL] =  0;
        this.s2[i + PART_ZVEL] =  0.0;
				this.s2[i + PART_R] = 1.0;
				this.s2[i + PART_G] = 1.0;
				this.s2[i + PART_B] = 0.0;
				this.s2[i + PART_X_FTOT] = 0.0
				this.s2[i + PART_Y_FTOT] = 0.0
				this.s2[i + PART_Z_FTOT] = -this.grav

        this.s2[i + PART_MASS] =  1.0;      // mass, in kg.
        this.s2[i + PART_DIAM] =  9.0;      // on-screen diameter, in pixels
      }
			for(var i = this.partCount[0]*PART_MAXVAR; i < this.partCount[1]*PART_MAXVAR + this.partCount[0]*PART_MAXVAR; i += PART_MAXVAR) {
        this.s1[i + PART_XPOS] = 0.0;      // lower-left corner of CVV
        this.s1[i + PART_YPOS] = 0.0;      // with a 0.1 margin
        this.s1[i + PART_ZPOS] =  0.0;
        this.s1[i + PART_WPOS] =  1.0;      // position 'w' coordinate;

        this.s1[i + PART_XVEL] =  0.0;
        this.s1[i + PART_YVEL] =  0.0;
        this.s1[i + PART_ZVEL] =  0.0;
				this.s1[i + PART_R] = 1.0;
				this.s1[i + PART_G] = 0.0;
				this.s1[i + PART_B] = 0.0;
				this.s1[i + PART_X_FTOT] = 0
				this.s1[i + PART_Y_FTOT] = 0
				this.s1[i + PART_Z_FTOT] = -this.grav

        this.s1[i + PART_MASS] =  1.0;      // mass, in kg.
        this.s1[i + PART_DIAM] =  9.0;      // on-screen diameter, in pixels
        //----------------------------
        this.s2[i + PART_XPOS] = 0.0;      // lower-left corner of CVV
        this.s2[i + PART_YPOS] = 0.0;      // with a 0.1 margin
        this.s2[i + PART_ZPOS] =  0.0;
        this.s2[i + PART_WPOS] =  1.0;      // position 'w' coordinate;

        this.s2[i + PART_XVEL] =  0.0;
        this.s2[i + PART_YVEL] =  0.0;
        this.s2[i + PART_ZVEL] =  0.0;
				this.s2[i + PART_R] = 1.0;
				this.s2[i + PART_G] = 0.0;
				this.s2[i + PART_B] = 0.0;
				this.s2[i + PART_X_FTOT] = 0.0
				this.s2[i + PART_Y_FTOT] = 0.0
				this.s2[i + PART_Z_FTOT] = -this.grav

        this.s2[i + PART_MASS] =  1.0;      // mass, in kg.
        this.s2[i + PART_DIAM] =  9.0;      // on-screen diameter, in pixels
      }
			for(var i = this.partCount[0]*PART_MAXVAR+this.partCount[1]*PART_MAXVAR; i < this.partCount[0]*PART_MAXVAR+this.partCount[1]*PART_MAXVAR+this.partCount[2]*PART_MAXVAR; i += PART_MAXVAR) {
        this.s1[i + PART_XPOS] = -0.9 + ((i-this.partCount[0]*PART_MAXVAR-this.partCount[1]*PART_MAXVAR) / PART_MAXVAR) % 10 * 0.3;      // lower-left corner of CVV
        this.s1[i + PART_YPOS] = -1.9 + Math.floor(((i-this.partCount[0]*PART_MAXVAR-this.partCount[1]*PART_MAXVAR) / PART_MAXVAR) / 10) * 0.3;    // with a 0.1 margin
        this.s1[i + PART_ZPOS] =  0.0;
        this.s1[i + PART_WPOS] =  1.0;      // position 'w' coordinate;

        this.s1[i + PART_XVEL] =  -1.5;
        this.s1[i + PART_YVEL] =  0.3*Math.random();
        this.s1[i + PART_ZVEL] =  0.0;
				this.s1[i + PART_X_FTOT] = 0;
				this.s1[i + PART_Y_FTOT] = 0;
				this.s1[i + PART_Z_FTOT] = 0;
				this.s1[i + PART_R] = 1.0;
				this.s1[i + PART_G] = 0.0;
				this.s1[i + PART_B] = 1.0;

        this.s1[i + PART_MASS] =  1.0;      // mass, in kg.
        this.s1[i + PART_DIAM] =  9.0;      // on-screen diameter, in pixels
        //----------------------------
        this.s2[i + PART_XPOS] = -0.9 + ((i-this.partCount[0]*PART_MAXVAR-this.partCount[1]*PART_MAXVAR) / PART_MAXVAR) % 10 * 0.3;      // lower-left corner of CVV
        this.s2[i + PART_YPOS] = -1.9 + Math.floor(((i-this.partCount[0]*PART_MAXVAR-this.partCount[1]*PART_MAXVAR) / PART_MAXVAR) / 10) * 0.3;      // with a 0.1 margin
        this.s2[i + PART_ZPOS] =  0.0;
        this.s2[i + PART_WPOS] =  1.0;      // position 'w' coordinate;

        this.s2[i + PART_XVEL] =  -1.5;
        this.s2[i + PART_YVEL] =  this.s1[i + PART_YVEL];
        this.s2[i + PART_ZVEL] =  0.0;
				this.s2[i + PART_X_FTOT] = 0.0;
				this.s2[i + PART_Y_FTOT] = 0.0;
				this.s2[i + PART_Z_FTOT] = 0;
				this.s2[i + PART_R] = 1.0;
				this.s2[i + PART_G] = 0.0;
				this.s2[i + PART_B] = 1.0;

        this.s2[i + PART_MASS] =  1.0;      // mass, in kg.
        this.s2[i + PART_DIAM] =  9.0;      // on-screen diameter, in pixels
      }
	for(var i = this.partCount[0]*PART_MAXVAR+this.partCount[1]*PART_MAXVAR+this.partCount[2]*PART_MAXVAR; i < this.partCount[0]*PART_MAXVAR+this.partCount[1]*PART_MAXVAR+this.partCount[2]*PART_MAXVAR+this.partCount[3]*PART_MAXVAR; i += PART_MAXVAR) {
        this.s1[i + PART_XPOS] = vertices[i/PART_MAXVAR-this.partCount[0]-this.partCount[1]-this.partCount[2]][0];      // lower-left corner of CVV
        this.s1[i + PART_YPOS] = vertices[i/PART_MAXVAR-this.partCount[0]-this.partCount[1]-this.partCount[2]][1];      // with a 0.1 margin
        this.s1[i + PART_ZPOS] = vertices[i/PART_MAXVAR-this.partCount[0]-this.partCount[1]-this.partCount[2]][2]; 
        this.s1[i + PART_WPOS] =  1.0;      // position 'w' coordinate;

        this.s1[i + PART_XVEL] =  0.0;
        this.s1[i + PART_YVEL] =  0.0;
        this.s1[i + PART_ZVEL] =  0.0;
				this.s1[i + PART_X_FTOT] = 0
				this.s1[i + PART_Y_FTOT] = 0
				this.s1[i + PART_Z_FTOT] = 0
				this.s1[i + PART_R] = 1.0;
				this.s1[i + PART_G] = 0.0;
				this.s1[i + PART_B] = 0.0;

        this.s1[i + PART_MASS] =  1.0;      // mass, in kg.
        this.s1[i + PART_DIAM] =  9.0;      // on-screen diameter, in pixels
        //----------------------------
        this.s2[i + PART_XPOS] = vertices[i/PART_MAXVAR-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]; 
        this.s2[i + PART_YPOS] = vertices[i/PART_MAXVAR-this.partCount[0]-this.partCount[1]-this.partCount[2]][1]; 
        this.s2[i + PART_ZPOS] = vertices[i/PART_MAXVAR-this.partCount[0]-this.partCount[1]-this.partCount[2]][2]; 
        this.s2[i + PART_WPOS] =  1.0;      // position 'w' coordinate;

        this.s2[i + PART_XVEL] =  0.0;
        this.s2[i + PART_YVEL] =  0.0;
        this.s2[i + PART_ZVEL] =  0.0;
				this.s2[i + PART_X_FTOT] = 0.0
				this.s2[i + PART_Y_FTOT] = 0.0
				this.s2[i + PART_Z_FTOT] = 0
				this.s2[i + PART_R] = 1.0;
				this.s2[i + PART_G] = 0.0;
				this.s2[i + PART_B] = 0.0;

        this.s2[i + PART_MASS] =  1.0;      // mass, in kg.
        this.s2[i + PART_DIAM] =  9.0;      // on-screen diameter, in pixels
      }
      this.FSIZE = this.s1.BYTES_PER_ELEMENT;  // 'float' size, in bytes.
		var cube = [
			-1.0, -1.0, 0.0 ,1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,

			-1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, -1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, 1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, -1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,

			-1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, 1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, 1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, 1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,

			1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, -1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, 1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, -1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			
			-1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, -1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, -1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, -1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,

			-1.0, -1.0, 1.8 ,1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, 1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, -1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, -1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			1.0, 1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			-1.0, 1.0, 1.8, 1.0, 1.0, 1.0, 1.0, 0.1,
			]
	  partical_and_grid = new Float32Array(this.s1.length/16*4 + gndVerts.length/7*4 + 36*4 + 30*2*4 + cylVerts.length/7*4)

	  for(var i = 0, j = 0; j < this.s1.length; i+=4,j+=16){
		  partical_and_grid[i] = this.s1[j]
		  partical_and_grid[i+1] = this.s1[j+1]
		  partical_and_grid[i+2] = this.s1[j+2]
		  partical_and_grid[i+3] = this.s1[j+3]
	  }

	  temp = new Array();
	  for(var i = 0; i < lines.length; i++){
		  for(var j = 0; j < lines[i].length; j++){
		  temp.push(this.s1[(i+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_XPOS]);
		  temp.push(this.s1[(i+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_YPOS]);
		  temp.push(this.s1[(i+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_ZPOS]);
		  temp.push(this.s1[(i+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_WPOS]);
		  temp.push(this.s1[(lines[i][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_XPOS]);
		  temp.push(this.s1[(lines[i][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_YPOS]);
		  temp.push(this.s1[(lines[i][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_ZPOS]);
		  temp.push(this.s1[(lines[i][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_WPOS]);
		}
	  
	}
	for(var i = this.s1.length/16*4,j = 0; i < +this.s1.length/16*4 + 30*2*4; i++, j++){
		partical_and_grid[i] = temp[j]
	}
	
	for(var i = this.s1.length/16*4+30*2*4 , j = 0; i < 36 * 4+this.s1.length/16*4+30*2*4; i +=4, j+=8){
		partical_and_grid[i] = cube[j];
		partical_and_grid[i+1] = cube[j+1];
		partical_and_grid[i+2] = cube[j+2];
		partical_and_grid[i+3] = cube[j+3];
	}
  	for(var i = this.s1.length/16*4 + 36 * 4+30*2*4,j = 0; i<partical_and_grid.length - cylVerts.length/7*4; i+=4,j+=7){
	  	partical_and_grid[i] = gndVerts[j]/10;
	  	partical_and_grid[i+1] = gndVerts[j+1]/10;
	  	partical_and_grid[i+2] = gndVerts[j+2]/10;
		partical_and_grid[i+3] = gndVerts[j+3]
  	}
  	for(var i = partical_and_grid.length - cylVerts.length/7*4,j = 0; i<partical_and_grid.length; i+=4,j+=7){
	  	partical_and_grid[i] = cylVerts[j];
	  	partical_and_grid[i+1] = cylVerts[j+1];
	  	partical_and_grid[i+2] = cylVerts[j+2];
		partical_and_grid[i+3] = gndVerts[j+3]
  	}
		color = new Float32Array(this.s1.length/16*4 + gndVerts.length/7*4 +36*4 + 30*2*4 + cylVerts.length/7*4);
		for(var i = 0, j = 0; j < this.s1.length; i+=4,j+=16){
			color[i] = this.s1[j+PART_R];
			color[i+1] = this.s1[j+PART_G];
			color[i+2] = this.s1[j+PART_B];
			color[i+3] = 1.0;
		}
		for(var i = this.s1.length/16*4; i < this.s1.length/16*4 + 240; i+=4){
		  color[i] = 1.0;
		  color[i+1] = 0.0;
		  color[i+2] = 0.0;
		  color[i+3] = 1.0;
	  	}
		for(var i = this.s1.length/16*4+240 , j = 4; i < 36 * 4 + this.s1.length/16*4+240; i +=4, j+=8){
			color[i] = cube[j];
			color[i+1] = cube[j+1];
			color[i+2] = cube[j+2];
			color[i+3] = cube[j+3];
		}
		for(var i = this.s1.length/16*4 + 36 * 4+240,j = 0; i < partical_and_grid.length - cylVerts.length/7*4; i+=4,j+=7){
		  color[i] = gndVerts[j+4];
		  color[i+1] = gndVerts[j+5];
		  color[i+2] = gndVerts[j+6];
		  color[i+3] = 1.0;
	  }
		for(var i = partical_and_grid.length - cylVerts.length/7*4,j = 0; i < partical_and_grid.length; i+=4,j+=7){
		  color[i] = cylVerts[j+4];
		  color[i+1] = cylVerts[j+5];
		  color[i+2] = cylVerts[j+6];
		  color[i+3] = 0.1;
	  }
    // Create a vertex buffer object (VBO) in the graphics hardware: get its ID# 
      this.vboID = gl.createBuffer();
  		this.colorID = gl.createBuffer();	
      if (!this.vboID) {
        console.log('g_partA.init() Failed to create the VBO object in the GPU');
        return -1;
      }
			gl.bindBuffer(gl.ARRAY_BUFFER,this.colorID);
			gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				color, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.  
      this.a_color = gl.getAttribLocation(gl.program, 'a_color');
			gl.vertexAttribPointer(this.a_color, 
                          4,  // # of values in this attrib (1,2,3,4) 
                          gl.FLOAT, // data type (usually gl.FLOAT)
                          false,    // use integer normalizing? (usually false)
                          4*this.FSIZE,  // Stride: #bytes from 1st stored value to next 
                          PART_XPOS*this.FSIZE); // Offset; #bytes from start of buffer to 
      // "Bind the new buffer object (memory in the graphics system) to target"
      // In other words, specify the usage of one selected buffer object.
      // What's a "Target"? it's the poorly-chosen OpenGL/WebGL name for the 
      // intended use of this buffer's memory; so far, we have just two choices:
      //	== "gl.ARRAY_BUFFER" meaning the buffer object holds actual values we 
      //      need for rendering (positions, colors, normals, etc), or 
      //	== "gl.ELEMENT_ARRAY_BUFFER" meaning the buffer object holds indices 
      // 			into a list of values we need; indices such as object #s, face #s, 
      //			edge vertex #s.
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vboID);
    
      // Write data from our JavaScript array to graphics systems' buffer object:
      gl.bufferData(gl.ARRAY_BUFFER, partical_and_grid, gl.STATIC_DRAW);
    
      // ---------Set up all attributes for VBO contents:
      //Get the ID# for the a_Position variable in the graphics hardware
      this.a_PositionID = gl.getAttribLocation(gl.program, 'a_Position');
      if(this.a_PositionID < 0) {
        console.log('g_partA.init() Failed to get the storage location of a_Position');
        return -1;
      }
  // Tell GLSL to fill the 'a_Position' attribute variable for each shader 
  // with values from the buffer object chosen by 'gl.bindBuffer()' command.
	// websearch yields OpenGL version: 
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml
  gl.vertexAttribPointer(this.a_PositionID, 
                          4,  // # of values in this attrib (1,2,3,4) 
                          gl.FLOAT, // data type (usually gl.FLOAT)
                          false,    // use integer normalizing? (usually false)
                          4*this.FSIZE,  // Stride: #bytes from 1st stored value to next 
                          PART_XPOS*this.FSIZE); // Offset; #bytes from start of buffer to 
                                    // 1st stored attrib value we will actually use.
  // Enable this assignment of the bound buffer to the a_Position variable:
			
  gl.enableVertexAttribArray(this.a_PositionID);
  gl.enableVertexAttribArray(this.a_color);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      // ---------Set up all uniforms we send to the GPU:
      // Get graphics system storage location of each uniform our shaders use:
      // (why? see  http://www.opengl.org/wiki/Uniform_(GLSL) )
      this.u_runModeID = gl.getUniformLocation(gl.program, 'u_runMode');
	  this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	  this.pointSize = gl.getUniformLocation(gl.program, 'pointSize');
      if(!this.u_runModeID) {
      	console.log('g_partA.init() Failed to get u_runMode variable location');
      	return;
      }
/* ELIMINATE the 'ballShift' uniform:
      this.u_ballShiftID = gl.getUniformLocation(gl.program, 'u_ballShift');
    	if(!this.u_ballShiftID) {
    		console.log('g_partA.init() Failed to get u_ballPos variable location');
    		return;
    	}
*/
      // Set the initial values of all uniforms on GPU: (runMode set by keyboard callbacks)
    	gl.uniform1i(this.u_runModeID, g_partA.runMode);
/* ELIMINATE the 'ballShift' uniform:
    	gl.uniform4f(this.u_ballShiftID, g_partA.s2[PART_XPOS], g_partA.s2[PART_YPOS], 0.0, 0.0); // send to gfx system
*/
      break;
    default:
      console.log('PartSys.init(): ERROR! invalid argument!');
      break;
  }
}

PartSys.prototype.applyForces = function(s, fSet) { 
//==============================================================================
// Clear the force-accumulator vector for each particle in state-vector 's', 
// then apply each force described in the collection of force-applying objects 
// found in 'fSet'.
// (this function will simplify our too-complicated 'draw()' function)
}

PartSys.prototype.dotFinder = function(src, dest) {
//==============================================================================
// fill the already-existing 'dest' variable (a float32array) with the 
// time-derivative of given state 'src'.
}

PartSys.prototype.render = function(s) {
	modelMatrix = new Matrix4();
	modelMatrix.setIdentity();    // DEFINE 'world-space' coords.

	var PM = new Matrix4();
	var VM = new Matrix4();
	PM.setPerspective(40.0-cameraX,1.0,1.0,1000.0);
	VM.setLookAt(5+cameraYX,0+cameraYY,2,5+cameraYX-Math.cos(Math.PI*cameraAngleY/180)*6*Math.cos(Math.PI*cameraAngleX/180),0+cameraYY+Math.sin(Math.PI*cameraAngleY/180)*6*Math.cos(Math.PI*cameraAngleX/180),-1.5+7*Math.sin(Math.PI*cameraAngleX/180),0,0,1);
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
    gl.uniform1f(this.pointSize, 10.0);
//==============================================================================
// Draw the contents of state-vector 's' on-screen. To do this:
//  a) transfer its contents to the already-existing VBO in the GPU using the
//      WebGL call 'gl.bufferSubData()', then 
//  b) set all the 'uniform' values needed by our shaders,
//  c) draw VBO contents using gl.drawArray().

	gl.uniform1i(this.u_runModeID, this.runMode);	// run/step/pause the particle system
/* ELIMINATE the 'ballShift' uniform:
	gl.uniform4f(g_partA.u_ballShiftID, g_partA.s2[PART_XPOS], g_partA.s2[PART_YPOS], 0.0, 0.0);	// send to gfx system
*/    
  // CHANGE our VBO's contents:
  var s1_p = new Float32Array(4*(this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3]+60));
  for(var i=0; i<this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3]; i++){
	  s1_p[i*4] = this.s1[i*16];
	  s1_p[i*4+1] = this.s1[i*16+1];
	  s1_p[i*4+2] = this.s1[i*16+2];	
	  s1_p[i*4+3] = this.s1[i*16+3];
  }
  var temp = new Array();
  for(var i = 0; i < lines.length; i++){
		  for(var j = 0; j < lines[i].length; j++){
		  temp.push(this.s1[(i+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_XPOS]);
		  temp.push(this.s1[(i+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_YPOS]);
		  temp.push(this.s1[(i+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_ZPOS]);
		  temp.push(this.s1[(i+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_WPOS]);
		  temp.push(this.s1[(lines[i][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_XPOS]);
		  temp.push(this.s1[(lines[i][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_YPOS]);
		  temp.push(this.s1[(lines[i][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_ZPOS]);
		  temp.push(this.s1[(lines[i][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR+PART_WPOS]);
		}
	}
	for(var i = 4*(this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3]), j = 0; i < s1_p.length; i++, j++){
		s1_p[i] = temp[j];
	}

	var s1_c = new Float32Array(4*this.partCount[1]);
	for(var i = this.partCount[0]; i<this.partCount[0]+this.partCount[1]; i++){
	  s1_c[(i-this.partCount[0])*4] = this.s1[i*16 + PART_R];
	  s1_c[(i-this.partCount[0])*4+1] = this.s1[i*16+ PART_G];
	  s1_c[(i-this.partCount[0])*4+2] = this.s1[i*16+ PART_B];	
	  s1_c[(i-this.partCount[0])*4+3] = 1.0;
  }

  gl.bufferSubData( gl.ARRAY_BUFFER,  // specify the 'binding target': either
                                      // gl.ARRAY_BUFFER (VBO holding sets of vertex attribs)
                                      // or gl.ELEMENT_ARRAY_BUFFER (VBO holding vertex-index values)
                                  0,  // offset: # of bytes to skip at the start
                                      // of the VBO before we begin data replacement.
                           s1_p);  // Float32Array data source.


  gl.bindBuffer(gl.ARRAY_BUFFER,this.colorID);
  gl.bufferSubData( gl.ARRAY_BUFFER,  // specify the 'binding target': either
                                      // gl.ARRAY_BUFFER (VBO holding sets of vertex attribs)
                                      // or gl.ELEMENT_ARRAY_BUFFER (VBO holding vertex-index values)
                                  this.partCount[0]*16,  // offset: # of bytes to skip at the start
                                      // of the VBO before we begin data replacement.
                           s1_c);  // Float32Array data source.
  // Draw our VBO's new contents:
  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboID);
  gl.drawArrays(gl.LINES, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] + 36 + 60, gndVerts.length/7);

	modelMatrix.setTranslate(0.7,0.7,0.0);
	modelMatrix.scale(0.5,0.5,0.5);	
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  gl.drawArrays(gl.POINTS, 0, this.partCount[0]);	
  gl.drawArrays(gl.TRIANGLES, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] +60, 36);

	pushMatrix(modelMatrix);
	modelMatrix.translate(0.4,-0.4,1.0);
  	modelMatrix.scale(0.2,0.2,0.2);
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] +60, 36);

	modelMatrix = popMatrix();
	modelMatrix.translate(-0.4,0.4,1.2);
  	modelMatrix.scale(0.2,0.2,0.2);
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] + 36 + 60 + gndVerts.length/7, cylVerts.length/7);

	modelMatrix.setTranslate(0.7,-0.7,0.0);
	modelMatrix.scale(0.5,0.5,0.5);	
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
  gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  	for(var i = 0; i < this.partCount[1]; i++){
    	gl.uniform1f(this.pointSize, this.s1[(this.partCount[0]+i)*16+PART_DIAM]);
		gl.drawArrays(gl.POINTS, this.partCount[0]+i, 1);	
	}
  gl.drawArrays(gl.TRIANGLES, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] + 60, 36);
	pushMatrix(modelMatrix);
	modelMatrix.translate(0.4,-0.4,1.0);
  	modelMatrix.scale(0.2,0.2,0.2);
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] +60, 36);
	modelMatrix = popMatrix();
	modelMatrix.translate(-0.4,0.4,1.2);
  	modelMatrix.scale(0.2,0.2,0.2);
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] + 36 + 60 + gndVerts.length/7, cylVerts.length/7);

    gl.uniform1f(this.pointSize, 5.0);
	modelMatrix.setTranslate(2.1,-0.7,0.0);
	modelMatrix.scale(0.5,0.5,0.5);	
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
  gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] + 60, 36);
	pushMatrix(modelMatrix);
	modelMatrix.translate(0.4,-0.4,1.0);
  	modelMatrix.scale(0.2,0.2,0.2);
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] +60, 36);
	modelMatrix = popMatrix();
	pushMatrix(modelMatrix);
	modelMatrix.scale(0.45,0.45,0.45);	
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
  gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
	gl.drawArrays(gl.POINTS, this.partCount[0] + this.partCount[1], this.partCount[2]);	
	modelMatrix = popMatrix();
	modelMatrix.translate(-0.4,0.4,1.2);
  	modelMatrix.scale(0.2,0.2,0.2);
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] + 36 + 60 + gndVerts.length/7, cylVerts.length/7);
	
    gl.uniform1f(this.pointSize, 10.0);
	modelMatrix.setTranslate(2.1,0.7,0.0);
	modelMatrix.scale(0.5,0.5,0.5);	
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
  gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] + 60, 36);
	pushMatrix(modelMatrix);
	modelMatrix.translate(0.4,-0.4,1.0);
  	modelMatrix.scale(0.2,0.2,0.2);
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] +60, 36);
	modelMatrix = popMatrix();
	pushMatrix(modelMatrix);
  modelMatrix.translate(0.0,0.0,1.0);
  modelMatrix.scale(0.5,0.5,0.5);	
  mvpMatrix = new Matrix4();
  mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
	gl.drawArrays(gl.POINTS, this.partCount[0] + this.partCount[1] + this.partCount[2], this.partCount[3]);	
	gl.drawArrays(gl.LINES, this.partCount[0] + this.partCount[1] + this.partCount[2] + this.partCount[3], 60);	
	modelMatrix = popMatrix();
	modelMatrix.translate(-0.4,0.4,1.2);
  	modelMatrix.scale(0.2,0.2,0.2);
	mvpMatrix = new Matrix4();
	mvpMatrix.set(PM).multiply(VM).multiply(modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, mvpMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, this.partCount[0]+this.partCount[1]+this.partCount[2]+this.partCount[3] + 36 + 60 + gndVerts.length/7, cylVerts.length/7);
	
}

 PartSys.prototype.solver = function() {
//==============================================================================
// Find next state s2 from current state s1.
}

PartSys.prototype.doConstraint = function() {
//==============================================================================
// apply all constraints to s1 and s2.
}

PartSys.prototype.swap = function() {
//==============================================================================
// Exchange contents of state-vector s1, s2.
}

//==============================================================================
// Vertex shader program:
var VSHADER_SOURCE =
  'precision mediump float;\n' +				// req'd in OpenGL ES if we use 'float'
  //
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform   int u_runMode; \n' +	
  'uniform   float pointSize; \n' +					// particle system state: 
  																				// 0=reset; 1= pause; 2=step; 3=run
// ELIMINATE THIS UNIFORM  'uniform	 vec4 u_ballShift; \n' +			// single bouncy-ball's movement
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_color;\n' +
  'varying   vec4 v_Color; \n' +
  'void main() {\n' +
  '  gl_PointSize = pointSize;\n' +            // TRY MAKING THIS LARGER...
  '	 gl_Position = u_ModelMatrix * a_Position; \n' +	
	// Let u_runMode determine particle color:
  '  v_Color = a_color;\n' +
  '} \n';
// Each instance computes all the on-screen attributes for just one VERTEX,
// supplied by 'attribute vec4' variable a_Position, filled from the 
// Vertex Buffer Object (VBO) we created inside the graphics hardware by calling 
// the 'initVertexBuffers()' function. 

//==============================================================================
// Fragment shader program:
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 v_Color; \n' +
  'void main() {\n' +
 '  float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); \n' +
  '  if(dist < 0.5) { \n' +	
	'  	gl_FragColor = vec4((1.0-2.0*dist)*v_Color.rgb, v_Color[3]);\n' +
	'  } else { discard; }\n' +
  '}\n';
// --Each instance computes all the on-screen attributes for just one PIXEL.
// --Draw large POINTS primitives as ROUND instead of square.  HOW?
//   See pg. 377 in  textbook: "WebGL Programming Guide".  The vertex shaders' 
// gl_PointSize value sets POINTS primitives' on-screen width and height, and
// by default draws POINTS as a square on-screen.  In the fragment shader, the 
// built-in input variable 'gl_PointCoord' gives the fragment's location within
// that 2D on-screen square; value (0,0) at squares' lower-left corner, (1,1) at
// upper right, and (0.5,0.5) at the center.  The built-in 'distance()' function
// lets us discard any fragment outside the 0.5 radius of POINTS made circular.
// (CHALLENGE: make a 'soft' point: color falls to zero as radius grows to 0.5)?
// -- NOTE! gl_PointCoord is UNDEFINED for all drawing primitives except POINTS;
// thus our 'draw()' function can't draw a LINE_LOOP primitive unless we turn off
// our round-point rendering.  
// -- All built-in variables: http://www.opengl.org/wiki/Built-in_Variable_(GLSL)

// Global Variables
// =========================
// Use globals to avoid needlessly complex & tiresome function argument lists.
// For example, the WebGL rendering context 'gl' gets used in almost every fcn;
// requiring 'gl' as an argument won't give us any added 'encapsulation'; make
// it global.  Later, if the # of global vars grows, we can unify them in to 
// one (or just a few) sensible global objects for better modularity.

var gl;   // webGL Rendering Context.  Created in main(), used everywhere.
var g_canvas; // our HTML-5 canvas object that uses 'gl' for drawing.

// For keyboard, mouse-click-and-drag: -----------------

var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;  

//--Animation---------------
var isClear = 1;		  // 0 or 1 to enable or disable screen-clearing in the
    									// draw() function. 'C' or 'c' key toggles in myKeyPress().
var g_last = Date.now();				//  Timestamp: set after each frame of animation,
																// used by 'animate()' function to find how much
																// time passed since we last updated our canvas.
var g_stepCount = 0;						// Advances by 1 for each timestep, modulo 1000, 
																// (0,1,2,3,...997,998,999,0,1,2,..) to identify 
																// WHEN the ball bounces.  RESET by 'r' or 'R'.

var g_timeStep = 1000.0/60.0;			// current timestep (1/60th sec) in milliseconds
var g_timeStepMin = g_timeStep;   // min,max timestep values since last keypress.
var g_timeStepMax = g_timeStep;


// Create & initialize a 1-particle 'state variables' s1,s2;
//---------------------------------------------------------
var g_partA = new PartSys([300,600,90,20]);     // create Particle System object for 1 particles.


function main() {
//==============================================================================
  // Retrieve <canvas> element
  g_canvas = document.getElementById('webgl');
	gl = g_canvas.getContext("webgl", { preserveDrawingBuffer: true});
	// NOTE: this disables HTML-5's default screen-clearing, so that our draw() 
	// function will over-write previous on-screen results until we call the 
	// gl.clear(COLOR_BUFFER_BIT); function. )
  if (!gl) {
    console.log('main() Failed to get the rendering context for WebGL');
    return;
  }
  
	// Register the Mouse & Keyboard Event-handlers-------------------------------
	// If users move, click or drag the mouse, or they press any keys on the 
	// the operating system will sense them immediately as 'events'.  
	// If you would like your program to respond to any of these events, you must 
	// tell JavaScript exactly how to do it: you must write your own 'event 
	// handler' functions, and then 'register' them; tell JavaScript WHICH 
	// events should cause it to call WHICH of your event-handler functions.
	//
	// First, register all mouse events found within our HTML-5 canvas:
	// when user's mouse button goes down call mouseDown() function,etc
  g_canvas.onmousedown	=	function(ev){myMouseDown(ev) }; 
  g_canvas.onmousemove = 	function(ev){myMouseMove(ev) };				
  g_canvas.onmouseup = 		function(ev){myMouseUp(  ev) };
  					// NOTE! 'onclick' event is SAME as on 'mouseup' event
  					// in Chrome Brower on MS Windows 7, and possibly other 
  					// operating systems; use 'mouseup' instead.

  // Next, register all keyboard events found within our HTML webpage window:
	window.addEventListener("keydown", myKeyDown, false);
	window.addEventListener("keyup", myKeyUp, false);
	window.addEventListener("keypress", myKeyPress, false);
  // The 'keyDown' and 'keyUp' events respond to ALL keys on the keyboard,
  // 			including shift,alt,ctrl,arrow, pgUp, pgDn,f1,f2...f12 etc. 
  //			I find these most useful for arrow keys; insert/delete; home/end, etc.
  // The 'keyPress' events respond only to alpha-numeric keys, and sense any 
  //  		modifiers such as shift, alt, or ctrl.  I find these most useful for
  //			single-number and single-letter inputs that include SHIFT,CTRL,ALT.
	// END Mouse & Keyboard Event-Handlers-----------------------------------
		
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('main() Failed to intialize shaders.');
    return;
  }

  gl.clearColor(0.25, 0.25, 0.25, 1);	 // RGBA color for clearing WebGL framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);		// clear it once to set that color as bkgnd.

  // Initialize Particle systems:
  g_partA.init(0);
/* CODE MOVED TO g_partA.init()...
  // Write the positions of vertices into an array, transfer array contents to a 
  // Vertex Buffer Object created in the graphics hardware.
  var myVerts = initVertexBuffers(gl);
  if (myVerts < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  
  // Get graphics system storage location of uniforms our shaders use:
  // (why? see  http://www.opengl.org/wiki/Uniform_(GLSL) )
  u_runModeID = gl.getUniformLocation(gl.program, 'u_runMode');
  if(!u_runModeID) {
  	console.log('Failed to get u_runMode variable location');
  	return;
  }
	gl.uniform1i(u_runModeID, g_partA.runMode);		// keyboard callbacks set g_partA.runMode

	u_ballShiftID = gl.getUniformLocation(gl.program, 'u_ballShift');
	if(!u_ballShiftID) {
		console.log('Failed to get u_ballPos variable location');
		return;
	}
	gl.uniform4f(u_ballShiftID, g_partA.s2[PART_XPOS], g_partA.s2[PART_YPOS], 0.0, 0.0); // send to gfx system
*/	
	// Display (initial) particle system values as text on webpage
	
  // Quick tutorial on synchronous, real-time animation in JavaScript/HTML-5: 
  //  	http://creativejs.com/resources/requestanimationframe/
  //		--------------------------------------------------------
  // Why use 'requestAnimationFrame()' instead of the simple-to-use
  //	fixed-time setInterval() or setTimeout() functions?  Because:
  //		1) it draws the next animation frame 'at the next opportunity' instead 
  //			of a fixed time interval. It allows your browser and operating system
  //			to manage its own processes, power, and computing loads and respond to 
  //			on-screen window placement (skip battery-draining animation in any 
  //			window hidden behind others, or scrolled off-screen)
  //		2) it helps your program avoid 'stuttering' or 'jittery' animation
  //			due to delayed or 'missed' frames.  Your program can read and respond 
  //			to the ACTUAL time interval between displayed frames instead of fixed
  //		 	fixed-time 'setInterval()' calls that may take longer than expected.
  var tick = function() {
	gs_last = Date.now();
    g_timeStep = animate(); 
                      // find how much time passed (in milliseconds) since the
                      // last call to 'animate()'.
    if(g_timeStep > 2000) {   // did we wait >2 seconds? 
      // YES. That's way too long for a single time-step; somehow our particle
      // system simulation got stopped -- perhaps user switched to a different
      // browser-tab or otherwise covered our browser window's HTML-5 canvas.
      // Resume simulation with a normal-sized time step:
      g_timeStep = 1000/60;
      }
  	draw(g_partA.partCount);    // compute new particle state at current time
    requestAnimationFrame(tick, g_canvas);
                      // Call tick() again 'at the next opportunity' as seen by 
                      // the HTML-5 element 'g_canvas'.
  };
  tick();
}

function animate() {
//==============================================================================  
// Returns how much time (in milliseconds) passed since the last call to this fcn.
  var now = Date.now();	        
  var elapsed = now - g_last;	// amount of time passed, in integer milliseconds
  g_last = now;               // re-set our stopwatch/timer.

  // INSTRUMENTATION:  (delete if you don't need to know the range of time-steps)
  g_stepCount = (g_stepCount +1)%1000;		// count 0,1,2,...999,0,1,2,...
  if     (elapsed < g_timeStepMin) g_timeStepMin = elapsed;  // update min/max
  else if(elapsed > g_timeStepMax) g_timeStepMax = elapsed;
  //-----------------------end instrumentation
  return elapsed;
}

function draw(n) {
//============================================================================== 
  // Clear WebGL frame-buffer? (The 'c' or 'C' key toggles isClear between 0 & 1).
	for(var i = 0; i < 30; i++){
	  if(counter == 600) counter = 0;
	  g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_XPOS] = 0.0;
	  g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_YPOS] = 0.0;
	  g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_ZPOS] = 0.0;
	  g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_XVEL] = 0.07*(Math.random()-0.5)*g_partA.INIT_VEL;
	  g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_YVEL] = 0.07*(Math.random()-0.5)*g_partA.INIT_VEL;
	  g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_ZVEL] = 0.14*g_partA.INIT_VEL;
	  g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_XPOS] = 0.0;
	  g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_YPOS] = 0.0;
	  g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_ZPOS] = 0.0;
	  g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_XVEL] = g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_XVEL];
	  g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_YVEL] = g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_YVEL];
	  g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_ZVEL] = 0.11*g_partA.INIT_VEL;
	  g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_MASS] = 1.0;
	  g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_MASS] = 1.0;
	  g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_G] = 0.0;
	  g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_DIAM] = 7.0;
	  g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + counter*PART_MAXVAR+PART_DIAM] = 7.0;
	  counter+=1;
  }
		for(var j = 0; j < 600; j++){
			g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + j*PART_MAXVAR+PART_MASS] -=0.05;
			g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + j*PART_MAXVAR+PART_MASS] -=0.05;
			g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + j*PART_MAXVAR+PART_Z_FTOT] = -g_partA.grav * g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + j*PART_MAXVAR+PART_MASS];
			g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + j*PART_MAXVAR+PART_Z_FTOT] = -g_partA.grav * g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + j*PART_MAXVAR+PART_MASS];
			g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + j*PART_MAXVAR+PART_G] += 0.05;
	 		g_partA.s1[g_partA.partCount[0]*PART_MAXVAR + j*PART_MAXVAR+PART_DIAM] -= 0.35;
	  		g_partA.s2[g_partA.partCount[0]*PART_MAXVAR + j*PART_MAXVAR+PART_DIAM] -= 0.35;
		}
  if(isClear == 1) gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// *** SURPRISE! ***
//  What happens when you forget (or comment-out) this gl.clear() call?
// In OpenGL (but not WebGL), you'd see 'trails' of particles caused by drawing 
// without clearing any previous drawing. But not in WebGL; by default, HTML-5 
// clears the canvas to white (your browser's default webpage color).  To see 
// 'trails' in WebGL you must disable the canvas' own screen clearing.  HOW?
// -- in main() where we create our WebGL drawing context, 
// replace this (default):
// -- with this:
// -- To learn more, see: 
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
	
// update particle system state?
  if(   g_partA.runMode > 1) {								// 0=reset; 1= pause; 2=step; 3=run
		if(g_partA.runMode == 2) g_partA.runMode=1;			// (if 2, do just one step and pause.)
		//=YES!=========================================
		// Make our 'bouncy-ball' move forward by one timestep, but now the 's' key 
		// will select which kind of solver to use:
		//------------------------------------------------------------------------
			// IMPLICIT or 'reverse time' solver, as found in bouncyBall04.goodMKS;
			// This category of solver is often better, more stable, but lossy.
			// -- apply acceleration due to gravity to current velocity:
			//				  s2[PART_YVEL] -= (accel. due to gravity)*(g_timestep in seconds) 
			//                  -= (9.832 meters/sec^2) * (g_timeStep/1000.0);
		for(var i = 0; i < g_partA.partCount[0]; i++){
			g_partA = g_partA.Wind(i);
		}
		for(var i = 0; i < g_partA.partCount[0]+g_partA.partCount[1]; i++){
			var a = g_partA.dotFinder(i);
			g_partA = g_partA.midPoint(i, a);
			g_partA = g_partA.swap(i);
			g_partA = g_partA.solver(i, a);
		}
		for(var i = g_partA.partCount[0]+g_partA.partCount[1]; i < g_partA.partCount[0]+g_partA.partCount[1]+g_partA.partCount[2]; i++){
			g_partA = g_partA.cohesion();
			g_partA = g_partA.alignment();
			g_partA = g_partA.separation();
			g_partA = g_partA.evasion();
			var a = g_partA.dotFinder(i);
			g_partA = g_partA.midPoint(i, a);
			g_partA = g_partA.swap(i);
			g_partA = g_partA.solver1(i, a);
		}
		for(var i = g_partA.partCount[0]+g_partA.partCount[1]+g_partA.partCount[2]; i < g_partA.partCount[0]+g_partA.partCount[1]+g_partA.partCount[2]+g_partA.partCount[3]; i++){
			if(isDrag == false){
				g_partA = g_partA.sprintForces(i);
			}
			var a = g_partA.dotFinder(i);
			g_partA = g_partA.midPoint(i, a);
			g_partA = g_partA.swap(i);
			g_partA = g_partA.solver2(i, a);
		}
			// What's the result of this rearrangement?
			//	IT WORKS BEAUTIFULLY! much more stable much more often...

		//==========================================================================
		// CONSTRAINTS -- 'bounce' our ball off floor & walls at (0,0), (1.8, 1.8):
		// where g_partA.bounceType selects constraint type:
		// ==0 for simple velocity-reversal, as in all previous versions
		// ==1 for Chapter 7's collision resolution method, which uses an 'impulse' 
		//      to cancel any velocity boost caused by falling below the floor.
		for(var i = 0; i < g_partA.partCount[0]+g_partA.partCount[1]; i++){
			g_partA = g_partA.doConstraint(i);
		}
		//for(var i = g_partA.partCount[0]+g_partA.partCount[1]+g_partA.partCount[2]; i < g_partA.partCount[0]+g_partA.partCount[1]+g_partA.partCount[2]+g_partA.partCount[3]; i++){
			//g_partA = g_partA.doConstraint(i);
		//}
		//============================================
	}

  g_partA.render();     // ask particle system to transfer s1 to VBO and draw it.
  
  // Report mouse-drag totals.
}

/* CONTENTS OF THIS FUNCTION MOVED to g_partA.init()
function initVertexBuffers() {
//==============================================================================
// Set up all buffer objects on our graphics hardware.

  var vertices = new Float32Array ([			// JUST ONE particle:
 //    0.0,  0.5, 0.0, 1.0,  				// x,y,z,w position
      -0.9, -0.9, 0.0, 1.0,  
 //    0.5, -0.5, 0.0, 1.0,
  ]);
  var vcount = 1;   // The number of vertices
  FSIZE = vertices.BYTES_PER_ELEMENT;

  
  // Create a buffer object in the graphics hardware: get its ID# 
  var vertexBufferID = gl.createBuffer();
  if (!vertexBufferID) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  // "Bind the new buffer object (memory in the graphics system) to target"
  // In other words, specify the usage of one selected buffer object.
  // What's a "Target"? it's the poorly-chosen OpenGL/WebGL name for the 
  // intended use of this buffer's memory; so far, we have just two choices:
  //	== "gl.ARRAY_BUFFER" meaning the buffer object holds actual values we need 
  //			for rendering (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" meaning the buffer object holds indices 
  // 			into a list of values we need; indices such as object #s, face #s, 
  //			edge vertex #s.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferID);

 // Write data from our JavaScript array to graphics systems' buffer object:
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Get the ID# for the a_Position variable in the graphics hardware
  var a_PositionID = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_PositionID < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_PositionID, 4, gl.FLOAT, false, 4*FSIZE, 0);
  // Tell GLSL to fill the 'a_Position' attribute variable for each shader 
  // with values from the buffer object chosen by 'gl.bindBuffer()' command.
	// websearch yields OpenGL version: 
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml
				//	glVertexAttributePointer (
				//			index == name of attribute variable used in the shader pgm.
				//			size == how many dimensions for this attribute: 1,2,3 or 4?
				//			type == what data type did we use for those numbers?
				//			isNormalized == are these fixed-point values that we need
				//						normalize before use? true or false
				//			stride == #bytes (of other, interleaved data) between OUR values?
				//			pointer == offset; how many (interleaved) values to skip to reach
				//					our first value?
				//				)
  // Enable this assignment of the bound buffer to the a_Position variable:
  gl.enableVertexAttribArray(a_PositionID);
 
  return g_partA.partCount;
}
*/

//===================Mouse and Keyboard event-handling Callbacks================
//==============================================================================
function myMouseDown(ev) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									  // x==0 at canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = true;											// set our mouse-dragging flag
	xMclik = x;													// record where mouse-dragging began
	yMclik = y;
};


function myMouseMove(ev) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

	if(isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									  // x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
	xMclik = x;													// Make next drag-measurement from here.
	yMclik = y;
	var offset = g_partA.partCount[0] + g_partA.partCount[1] + g_partA.partCount[2];
	for(var i = 0; i < 5; i++){
		g_partA.s1[PART_YPOS + (i+offset) * 16] += x*0.01;
		g_partA.s1[PART_ZPOS + (i+offset) * 16] += y*0.01;
		g_partA.s2[PART_YPOS + (i+offset) * 16] += x*0.01;
		g_partA.s2[PART_ZPOS + (i+offset) * 16] += y*0.01;
	}
	draw(g_partA.partCount);
// (? why no 'document.getElementById() call here, as we did for myMouseDown()
// and myMouseUp()? Because the webpage doesn't get updated when we move the 
// mouse. Put the web-page updating command in the 'draw()' function instead)
};

function myMouseUp(ev) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									  // x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	xMdragTot += (x - xMclik);
	yMdragTot += (y - yMclik);
	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
	// Put it on our webpage too...
	debugger;
};


function myKeyDown(ev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard, and captures the 
// keyboard's scancode or keycode (varies for different countries and alphabets).
//  CAUTION: You may wish to avoid 'keydown' and 'keyup' events: if you DON'T 
// need to sense non-ASCII keys (arrow keys, function keys, pgUp, pgDn, Ins, 
// Del, etc), then just use the 'keypress' event instead.
//	 The 'keypress' event captures the combined effects of alphanumeric keys and 
// the SHIFT, ALT, and CTRL modifiers.  It translates pressed keys into ordinary
// ASCII codes; you'll get uppercase 'S' if you hold shift and press the 's' key.
//
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of the messy way JavaScript handles keyboard events
// see:    http://javascript.info/tutorial/keyboard-events
//

/*
	switch(ev.keyCode) {			// keycodes !=ASCII, but are very consistent for 
	//	nearly all non-alphanumeric keys for nearly all keyboards in all countries.
		case 37:		// left-arrow key
			// print in console:
			console.log(' left-arrow.');
			// and print on webpage in the <div> element with id='Result':
  		document.getElementById('KeyResult').innerHTML =
  			' Left Arrow:keyCode='+ev.keyCode;
			break;
		case 38:		// up-arrow key
			console.log('   up-arrow.');
  		document.getElementById('KeyResult').innerHTML =
  			'   Up Arrow:keyCode='+ev.keyCode;
			break;
		case 39:		// right-arrow key
			console.log('right-arrow.');
  		document.getElementById('KeyResult').innerHTML =
  			'Right Arrow:keyCode='+ev.keyCode;
  		break;
		case 40:		// down-arrow key
			console.log(' down-arrow.');
  		document.getElementById('KeyResult').innerHTML =
  			' Down Arrow:keyCode='+ev.keyCode;
  		break;
		default:
			console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
  		document.getElementById('KeyResult').innerHTML =
  			'myKeyDown()--keyCode='+ev.keyCode;
			break;
	}
*/
}

function myKeyUp(ev) {
//==============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well
// You probably don't want to use this ('myKeyDown()' explains why); you'll find
// myKeyPress() can handle nearly all your keyboard-interface needs.
/*
	console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');
*/
}

function myKeyPress(ev) {
//==============================================================================
// Best for capturing alphanumeric keys and key-combinations such as 
// CTRL-C, alt-F, SHIFT-4, etc.  Use this instead of myKeyDown(), myKeyUp() if
// you don't need to respond separately to key-down and key-up events.
/*
	// Report EVERYTHING about this pressed key in the console:
	console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
												', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
												', altKey='   +ev.altKey   +
												', metaKey(Command key or Windows key)='+ev.metaKey);
*/
  // RESET our g_timeStep min/max recorder:
  g_timeStepMin = g_timeStep;
  g_timeStepMax = g_timeStep;
	myChar = String.fromCharCode(ev.keyCode);	//	convert code to character-string
	// Report EVERYTHING about this pressed key in the webpage 
	// in the <div> element with id='Result':r 
/*  document.getElementById('KeyResult').innerHTML = 
   			'char= ' 		 	+ myChar 			+ ', keyCode= '+ ev.keyCode 	+ 
   			', charCode= '+ ev.charCode + ', shift= '	 + ev.shiftKey 	+ 
   			', ctrl= '		+ ev.shiftKey + ', altKey= ' + ev.altKey 		+ 
   			', metaKey= '	+ ev.metaKey 	+ '<br>' ;
*/  			
  // update particle system state? g_partA.runMode 0=reset; 1= pause; 2=step; 3=run
  console.log(ev.code)
  switch(ev.code) {
	case "KeyJ": 	
  animateKey(0);
		break;
	case "KeyL":
  animateKey(1);
	  break;
	case "KeyI":
  animateKey(2);
	  break;
	case "KeyK":
  animateKey(3);
	  break;
	case "KeyA":
  animateKey(4);
	  break;
	case "KeyD":
  animateKey(5);
	  break;
	case "KeyW":
  animateKey(6);
	  break;
	case "KeyS":
  animateKey(7);
	  break;
default:
  break;
}
	switch(myChar) {
		case 'e':
			if(g_partA.solvType == 3){
				g_partA.solvType = 0
				document.getElementById("solver").innerHTML = "current solver: midpoint";
			}
			else if(g_partA.solvType == 0){
				g_partA.solvType += 1
				document.getElementById("solver").innerHTML = "current solver: explicit euler";
			}
			else if(g_partA.solvType == 1){
				g_partA.solvType += 1
				document.getElementById("solver").innerHTML = "current solver: implicit euler";
			}
			else if(g_partA.solvType == 2){
				g_partA.solvType += 1
				document.getElementById("solver").innerHTML = "current solver: explicit midpoint";
			}
			break;					// 'c' or 'C' key:  toggle screen clearing
		case 'C':					// to demonstrate 'trails'.
			if(isClear == 0) isClear = 1;
			else isClear = 0;
			break;
		case 'r':		// 'refresh' -- boost velocity only; return to 'run'
		  g_partA.runMode = 3;  // RUN!
		  for(var i = 0; i < g_partA.partCount[0]; i++){
			g_partA = g_partA.applyAllForces(g_partA.INIT_VEL, i);
			}
			break;	
		default:
			console.log('myKeyPress(): Ignored key: '+myChar);
			break;
	}
}



function onPlusButton() {
//==============================================================================
	g_partA.INIT_VEL *= 1.2;		// increase
	console.log('Initial velocity: '+g_partA.INIT_VEL);
}

function onMinusButton() {
//==============================================================================
	g_partA.INIT_VEL /= 1.2;		// shrink
	console.log('Initial velocity: '+g_partA.INIT_VEL);
}

function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	var xcount = 100;			// # of lines to draw in x,y to make the grid.
	var ycount = 100;		
	var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
 	var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
 	var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.
	var floatsPerVertex = 7
 	
	// Create an (global) array to hold this ground-plane's vertices:
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						// draw a grid made of xcount+ycount lines; 2 vertices per line.
						
	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
	
	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		gndVerts[j+4] = xColr[0];			// red
		gndVerts[j+5] = xColr[1];			// grn
		gndVerts[j+6] = xColr[2];			// blu
	}
	// Second, step thru y values as wqe make horizontal lines of constant-y:
	// (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		gndVerts[j+4] = yColr[0];			// red
		gndVerts[j+5] = yColr[1];			// grn
		gndVerts[j+6] = yColr[2];			// blu
	}
}

function animateKey(direction) {
	var now = Date.now();
	var gap = now - gs_last;
		switch(direction) {
		  case 0: 	
		  cameraAngleY -= gap/10;
			  break;
		  case 1:
		  cameraAngleY += gap/10;
			break;
		  case 2:
		  cameraAngleX += gap/10;
			break;
		  case 3:
		  cameraAngleX -= gap/10;
			break;
		  case 4:
		  cameraYX -= gap/1000*Math.sin(Math.PI*cameraAngleY/180);
		  cameraYY -= gap/1000*Math.cos(Math.PI*cameraAngleY/180);
			break;
		  case 5:
		  cameraYX += gap/1000*Math.sin(Math.PI*cameraAngleY/180);
		  cameraYY += gap/1000*Math.cos(Math.PI*cameraAngleY/180);
			break;
		  case 6:
		  cameraX += gap/100;
			break;
		  case 7:
		  cameraX -= gap/100;
			break;
	  default:
		break;
	  }
	  if(cameraAngleY > 360) cameraAngleY -= 360;
	  else if(cameraAngleY < 0) cameraAngleY +=360;
	  if(cameraAngleX > 360) cameraAngleX -= 360;
	  else if(cameraAngleX < 0) cameraAngleX +=360;
  }


PartSys.prototype.applyAllForces = function(force,i){
	if(this.s1[16*i+PART_XVEL] > 0.0)
		this.s1[16*i+PART_X_FTOT]+=force*Math.random()*5;
	else
		this.s1[16*i+PART_X_FTOT]-=force*Math.random()*5;
	if(this.s1[16*i+PART_YVEL] > 0.0)
		this.s1[16*i+PART_Y_FTOT]+=force*Math.random()*5;
	else
		this.s1[16*i+PART_Y_FTOT]-=force*Math.random()*5;
	if(this.s1[16*i+PART_ZVEL] > 0.0)
		this.s1[16*i+PART_Z_FTOT]+=force*Math.random()*5;
	else
		this.s1[16*i+PART_Z_FTOT]-=force*Math.random()*5;
	return this;
}

PartSys.prototype.dotFinder = function(i){
	a = [this.s1[16*i+PART_X_FTOT]/this.s1[16*i+PART_MASS],this.s1[16*i+PART_Y_FTOT]/this.s1[16*i+PART_MASS],this.s1[16*i+PART_Z_FTOT]/this.s1[16*i+PART_MASS]]
	return a
}

PartSys.prototype.midPoint = function(i,a){
	this.sm = this.s1;
	this.sm[PART_XVEL+16*i] += a[0]*(g_timeStep*0.001)/2;
	this.sm[PART_YVEL+16*i] += a[1]*(g_timeStep*0.001)/2;
	this.sm[PART_ZVEL+16*i] += a[2]*(g_timeStep*0.001)/2;
	this.sm[PART_XPOS+16*i] += this.sm[PART_XVEL+16*i]*(g_timeStep*0.001)/2;
	this.sm[PART_YPOS+16*i] += this.sm[PART_YVEL+16*i]*(g_timeStep*0.001)/2;
	this.sm[PART_ZPOS+16*i] += this.sm[PART_ZVEL+16*i]*(g_timeStep*0.001)/2;
	return this;
}

PartSys.prototype.swap = function(i){
	this.s1[PART_XPOS+16*i] = this.s2[PART_XPOS+16*i];			// SAVE these values before we update them.
	this.s1[PART_XVEL+16*i] = this.s2[PART_XVEL+16*i];			// (for use in constraint-applying code below).
	this.s1[PART_YPOS+16*i] = this.s2[PART_YPOS+16*i];
	this.s1[PART_YVEL+16*i] = this.s2[PART_YVEL+16*i];
	this.s1[PART_ZPOS+16*i] = this.s2[PART_ZPOS+16*i];
	this.s1[PART_ZVEL+16*i] = this.s2[PART_ZVEL+16*i];
	this.s1[PART_X_FTOT+16*i] = this.s2[PART_X_FTOT+16*i];
	this.s1[PART_Y_FTOT+16*i] = this.s2[PART_Y_FTOT+16*i];
	this.s1[PART_Z_FTOT+16*i] = this.s2[PART_Z_FTOT+16*i];
	return this;
}

/*PartSys.prototype.solver = function(i,a){
			//-------------------
	this.s2[PART_ZVEL+16*i] += a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] += a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] += a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = -this.grav;
	if(this.s2[PART_XVEL+16*i] > 0)
		this.s2[16*i+PART_X_FTOT] = -this.drag;
	else if(this.s2[PART_XVEL+16*i] < 0)
		this.s2[16*i+PART_X_FTOT] = this.drag;
	if(this.s2[PART_YVEL+16*i] > 0)
		this.s2[16*i+PART_Y_FTOT] = -this.drag;
	else if(this.s2[PART_YVEL+16*i] < 0)
		this.s2[16*i+PART_Y_FTOT] = this.drag;
	if(this.s2[PART_ZVEL+16*i] > 0)
		this.s2[16*i+PART_Z_FTOT] = -this.grav-this.drag;
	else if(this.s2[PART_ZVEL+16*i] < 0)
		this.s2[16*i+PART_Z_FTOT] = this.drag-this.grav;
			// -- move our particle using current velocity:
			// CAREFUL! must convert g_timeStep from milliseconds to seconds!
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
	return this;
}*/

PartSys.prototype.solver = function(i,a){
	if(this.solvType == 0){
			//-------------------
	this.s2[PART_ZVEL+16*i] = this.sm[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.sm[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.sm[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = -this.grav * this.s2[16*i+PART_MASS];
	if(this.s2[PART_XVEL+16*i] > 0)
		this.s2[16*i+PART_X_FTOT] = -this.drag;
	else if(this.s2[PART_XVEL+16*i] < 0)
		this.s2[16*i+PART_X_FTOT] = this.drag;
	if(this.s2[PART_YVEL+16*i] > 0)
		this.s2[16*i+PART_Y_FTOT] = -this.drag;
	else if(this.s2[PART_YVEL+16*i] < 0)
		this.s2[16*i+PART_Y_FTOT] = this.drag;
	if(this.s2[PART_ZVEL+16*i] > 0)
		this.s2[16*i+PART_Z_FTOT] = -(this.grav * this.s2[16*i+PART_MASS])-this.drag;
	else if(this.s2[PART_ZVEL+16*i] < 0)
		this.s2[16*i+PART_Z_FTOT] = this.drag-(this.grav * this.s2[16*i+PART_MASS]);
			// -- move our particle using current velocity:
			// CAREFUL! must convert g_timeStep from milliseconds to seconds!
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
}
else if(this.solvType == 1){
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZVEL+16*i] = this.s1[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.s1[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.s1[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = -this.grav * this.s2[16*i+PART_MASS];
	if(this.s2[PART_XVEL+16*i] > 0)
		this.s2[16*i+PART_X_FTOT] = -this.drag;
	else if(this.s2[PART_XVEL+16*i] < 0)
		this.s2[16*i+PART_X_FTOT] = this.drag;
	if(this.s2[PART_YVEL+16*i] > 0)
		this.s2[16*i+PART_Y_FTOT] = -this.drag;
	else if(this.s2[PART_YVEL+16*i] < 0)
		this.s2[16*i+PART_Y_FTOT] = this.drag;
	if(this.s2[PART_ZVEL+16*i] > 0)
		this.s2[16*i+PART_Z_FTOT] = -(this.grav * this.s2[16*i+PART_MASS])-this.drag;
	else if(this.s2[PART_ZVEL+16*i] < 0)
		this.s2[16*i+PART_Z_FTOT] = this.drag-(this.grav * this.s2[16*i+PART_MASS]);
}
else if(this.solvType == 2){
	this.s2[PART_ZVEL+16*i] = this.s1[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.s1[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.s1[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = -this.grav * this.s2[16*i+PART_MASS];
	if(this.s2[PART_XVEL+16*i] > 0)
		this.s2[16*i+PART_X_FTOT] = -this.drag;
	else if(this.s2[PART_XVEL+16*i] < 0)
		this.s2[16*i+PART_X_FTOT] = this.drag;
	if(this.s2[PART_YVEL+16*i] > 0)
		this.s2[16*i+PART_Y_FTOT] = -this.drag;
	else if(this.s2[PART_YVEL+16*i] < 0)
		this.s2[16*i+PART_Y_FTOT] = this.drag;
	if(this.s2[PART_ZVEL+16*i] > 0)
		this.s2[16*i+PART_Z_FTOT] = -(this.grav * this.s2[16*i+PART_MASS])-this.drag;
	else if(this.s2[PART_ZVEL+16*i] < 0)
		this.s2[16*i+PART_Z_FTOT] = this.drag-(this.grav * this.s2[16*i+PART_MASS]);
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
}
else if(this.solvType == 3){
			//-------------------
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZVEL+16*i] = this.sm[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.sm[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.sm[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = -this.grav * this.s2[16*i+PART_MASS];
	if(this.s2[PART_XVEL+16*i] > 0)
		this.s2[16*i+PART_X_FTOT] = -this.drag;
	else if(this.s2[PART_XVEL+16*i] < 0)
		this.s2[16*i+PART_X_FTOT] = this.drag;
	if(this.s2[PART_YVEL+16*i] > 0)
		this.s2[16*i+PART_Y_FTOT] = -this.drag;
	else if(this.s2[PART_YVEL+16*i] < 0)
		this.s2[16*i+PART_Y_FTOT] = this.drag;
	if(this.s2[PART_ZVEL+16*i] > 0)
		this.s2[16*i+PART_Z_FTOT] = -(this.grav * this.s2[16*i+PART_MASS])-this.drag;
	else if(this.s2[PART_ZVEL+16*i] < 0)
		this.s2[16*i+PART_Z_FTOT] = this.drag-(this.grav * this.s2[16*i+PART_MASS]);
			// -- move our particle using current velocity:
			// CAREFUL! must convert g_timeStep from milliseconds to seconds!
}
	return this;
}

PartSys.prototype.solver1 = function(i,a){
	if(this.solvType == 0){
			//-------------------
	this.s2[PART_ZVEL+16*i] = this.sm[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.sm[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.sm[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = 0;
			// -- move our particle using current velocity:
			// CAREFUL! must convert g_timeStep from milliseconds to seconds!
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
}
else if(this.solvType == 1){
	
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZVEL+16*i] = this.s1[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.s1[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.s1[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = 0;
}
else if(this.solvType == 2){
	
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZVEL+16*i] = this.s1[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.s1[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.s1[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = 0;
}
	else if(this.solvType == 3){
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
			//-------------------
	this.s2[PART_ZVEL+16*i] = this.sm[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.sm[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.sm[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = 0;
			// -- move our particle using current velocity:
			// CAREFUL! must convert g_timeStep from milliseconds to seconds!
}
	return this;
}

PartSys.prototype.solver2 = function(i,a){
	var co = 0.5;
	if(this.solvType == 0){
			//-------------------
	this.s2[PART_ZVEL+16*i] = this.sm[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.sm[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.sm[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = 0;
	if(this.s2[PART_XVEL+16*i] > 0)
		this.s2[16*i+PART_X_FTOT] = -co*this.drag;
	else if(this.s2[PART_XVEL+16*i] < 0)
		this.s2[16*i+PART_X_FTOT] = co*this.drag;
	if(this.s2[PART_YVEL+16*i] > 0)
		this.s2[16*i+PART_Y_FTOT] = -co*this.drag;
	else if(this.s2[PART_YVEL+16*i] < 0)
		this.s2[16*i+PART_Y_FTOT] = co*this.drag;
	if(this.s2[PART_ZVEL+16*i] > 0)
		this.s2[16*i+PART_Z_FTOT] = -co*this.drag;
	else if(this.s2[PART_ZVEL+16*i] < 0)
		this.s2[16*i+PART_Z_FTOT] = co*this.drag;
			// -- move our particle using current velocity:
			// CAREFUL! must convert g_timeStep from milliseconds to seconds!
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
}
else if(this.solvType == 1){
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZVEL+16*i] = this.s1[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.s1[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.s1[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = 0;
	if(this.s2[PART_XVEL+16*i] > 0)
		this.s2[16*i+PART_X_FTOT] = -co*this.drag;
	else if(this.s2[PART_XVEL+16*i] < 0)
		this.s2[16*i+PART_X_FTOT] = co*this.drag;
	if(this.s2[PART_YVEL+16*i] > 0)
		this.s2[16*i+PART_Y_FTOT] = -co*this.drag;
	else if(this.s2[PART_YVEL+16*i] < 0)
		this.s2[16*i+PART_Y_FTOT] = co*this.drag;
	if(this.s2[PART_ZVEL+16*i] > 0)
		this.s2[16*i+PART_Z_FTOT] = -co*this.drag;
	else if(this.s2[PART_ZVEL+16*i] < 0)
		this.s2[16*i+PART_Z_FTOT] = co*this.drag;
}
else if(this.solvType == 2){
	this.s2[PART_ZVEL+16*i] = this.s1[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.s1[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.s1[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = 0;
	if(this.s2[PART_XVEL+16*i] > 0)
		this.s2[16*i+PART_X_FTOT] = -co*this.drag;
	else if(this.s2[PART_XVEL+16*i] < 0)
		this.s2[16*i+PART_X_FTOT] = co*this.drag;
	if(this.s2[PART_YVEL+16*i] > 0)
		this.s2[16*i+PART_Y_FTOT] = -co*this.drag;
	else if(this.s2[PART_YVEL+16*i] < 0)
		this.s2[16*i+PART_Y_FTOT] = co*this.drag;
	if(this.s2[PART_ZVEL+16*i] > 0)
		this.s2[16*i+PART_Z_FTOT] = -co*this.drag;
	else if(this.s2[PART_ZVEL+16*i] < 0)
		this.s2[16*i+PART_Z_FTOT] = co*this.drag;
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
}
else if(this.solvType == 3){
	this.s2[PART_XPOS+16*i] += this.s2[PART_XVEL+16*i] * (g_timeStep * 0.001);
	this.s2[PART_YPOS+16*i] += this.s2[PART_YVEL+16*i] * (g_timeStep * 0.001); 
	this.s2[PART_ZPOS+16*i] += this.s2[PART_ZVEL+16*i] * (g_timeStep * 0.001); 
			//-------------------
	this.s2[PART_ZVEL+16*i] = this.sm[PART_ZVEL+16*i] + a[2]*(g_timeStep*0.001);
			// -- apply drag: attenuate current velocity:
	this.s2[PART_XVEL+16*i] = this.sm[PART_XVEL+16*i] + a[0]*(g_timeStep*0.001);
	this.s2[PART_YVEL+16*i] = this.sm[PART_YVEL+16*i] + a[1]*(g_timeStep*0.001);
	this.s2[16*i+PART_X_FTOT] = 0;
	this.s2[16*i+PART_Y_FTOT] = 0;
	this.s2[16*i+PART_Z_FTOT] = 0;
	if(this.s2[PART_XVEL+16*i] > 0)
		this.s2[16*i+PART_X_FTOT] = -co*this.drag;
	else if(this.s2[PART_XVEL+16*i] < 0)
		this.s2[16*i+PART_X_FTOT] = co*this.drag;
	if(this.s2[PART_YVEL+16*i] > 0)
		this.s2[16*i+PART_Y_FTOT] = -co*this.drag;
	else if(this.s2[PART_YVEL+16*i] < 0)
		this.s2[16*i+PART_Y_FTOT] = co*this.drag;
	if(this.s2[PART_ZVEL+16*i] > 0)
		this.s2[16*i+PART_Z_FTOT] = -co*this.drag;
	else if(this.s2[PART_ZVEL+16*i] < 0)
		this.s2[16*i+PART_Z_FTOT] = co*this.drag;
			// -- move our particle using current velocity:
			// CAREFUL! must convert g_timeStep from milliseconds to seconds!
}
	return this;
}

PartSys.prototype.doConstraint = function(i){
if(      this.s2[PART_XPOS+16*i] < -0.9 && this.s2[PART_XVEL+16*i] < 0.0 ) {
			// collision!  left wall...
				this.s2[PART_XPOS+16*i] = -0.9;					// 1) resolve contact: put particle at wall.
																// 2) repair velocity: remove all erroneous x 
																// velocity gained from forces applied while the 
																// ball moved thru wall during this timestep. HOW?  
																// a) EASY: assume the worst-- Assume ball 
																// reached wall at START of the timestep; thus 
																// ALL the timesteps' velocity changes after that
																// were erroneous. Let's go back to the velocity
				// (NOTE: statistically, hitting the wall is equally probable at any
				// time during the timestep, so the 'expected value' of collision is at
				// the timestep's midpoint.  THUS removing HALF the new velocity during
				// the timestep would create errors with a statistical mean of zero.  
				//
				// 		Unwittingly, we have already created that result!
				//============================================================
				// For simplicity, assume our timestep's erroneous velocity change 
				// was the result of constant acceleration (e.g. result of constant 
				// gravity acting constant mass, plus constant drag force, etc).  If the 
				// ball 'bounces' (reverses velocity) exactly halfway through the 
				// timestep, then at the statistical 'expected value' for collision 
				// time, then the constant force that acts to INCREASE velocity in one 
				// half-timestep will act to DECREASE velocity in the other half 
				// timestep by exactly the same amount -- and thus removes ALL the 
				// velocity added by constant force during the timestep.)
				this.s2[PART_XVEL+16*i] *= this.drag;			
				                        // **BUT** velocity during our timestep is STILL 
																// reduced by drag (and any other forces
																// proportional to velocity, and thus not
																// cancelled by 'bounce' at timestep's midpoint) 
																// 3) BOUNCE:  
																//reversed velocity*coeff-of-restitution.
				// ATTENTION! VERY SUBTLE PROBLEM HERE! ------------------------------
				//Balls with tiny, near-zero velocities (e.g. ball nearly at rest on 
				// floor) can easily reverse sign between 'previous' and 'now' 
				// timesteps, even for negligible forces.  Put another way:
				// Step 2), our 'repair' attempt that removes all erroneous x velocity, 
				// has CHANGED the 'now' ball velocity, and MAY have changed its sign as 
				// well,  especially when the ball is nearly at rest. SUBTLE: THUS we 
				// need a velocity-sign test here that ensures the 'bounce' step will 
				// always send the ball outwards, away from its wall or floor collision. 
				if(  this.s2[PART_XVEL+16*i] < 0.0) 
				    this.s2[PART_XVEL+16*i] = -this.resti * this.s2[PART_XVEL+16*i]; // no sign change--bounce!
				else 
				    this.s2[PART_XVEL+16*i] =  this.resti * this.s2[PART_XVEL+16*i];	// sign changed-- don't need another.
      			// ('diagnostic printing' code was here in earlier versions.)
			}
			else if (this.s2[PART_XPOS+16*i] >  0.9 && this.s2[PART_XVEL+16*i] > 0.0) {		// collision! right wall...

				this.s2[PART_XPOS+16*i] = 0.9;					// 1) resolve contact: put particle at wall.
																// 2) remove all x velocity gained from forces as
																// ball moved thru wall in this timestep. HOW?
																// Assume ball reached wall at START of
																// the timestep, thus: return to the orig.
				this.s2[PART_XVEL+16*i] *= this.drag;			
				                        // **BUT** reduced by drag (and any other forces 
																// 	that still apply during this timestep).
																// 3) BOUNCE:  
																//reversed velocity*coeff-of-restitution.
				if(this.s2[PART_XVEL+16*i] > 0.0) 
				    this.s2[PART_XVEL+16*i] = -this.resti * this.s2[PART_XVEL+16*i]; // no sign change--bounce!
				else 
				    this.s2[PART_XVEL+16*i] =  this.resti * this.s2[PART_XVEL+16*i];	// sign changed-- don't need another.
      			// ('diagnostic printing' code was here in earlier versions.)
			}
			if( this.s2[PART_YPOS+16*i] < -0.9 && this.s2[PART_YVEL+16*i] < 0.0) {		// collision! floor...
	      		// ('diagnostic printing' code was here in earlier versions.)

				this.s2[PART_YPOS+16*i] = -0.9;					// 1) resolve contact: put particle at wall.
																// 2) remove all y velocity gained from forces as
																// ball moved thru floor in this timestep. HOW?
																// Assume ball reached floor at START of
																// the timestep, thus: return to the orig.
				this.s2[PART_YVEL+16*i] *= this.drag;			
				                        // **BUT** reduced by drag (and any other forces 
																// 	that still apply during this timestep).
																// 3) BOUNCE:  
																//reversed velocity*coeff-of-restitution.
				// ATTENTION! VERY SUBTLE PROBLEM HERE! ------------------------------
				//Balls with tiny, near-zero velocities (e.g. ball nearly at rest on 
				// floor) can easily reverse sign between 'previous' and 'now' 
				// timesteps, even for negligible forces.  Put another way:
				// Step 2), our 'repair' attempt that removes all erroneous x velocity, 
				// has CHANGED the 'now' ball velocity, and MAY have changed its sign as 
				// well,  especially when the ball is nearly at rest. SUBTLE: THUS we 
				// need a velocity-sign test here that ensures the 'bounce' step will 
				// always send the ball outwards, away from its wall or floor collision. 
				if(this.s2[PART_YVEL+16*i] < 0.0) 
				    this.s2[PART_YVEL+16*i] = -this.resti * this.s2[PART_YVEL+16*i]; // no sign change--bounce!
				else 
				    this.s2[PART_YVEL+16*i] =  this.resti * this.s2[PART_YVEL+16*i];	// sign changed-- don't need another.
		      // ('diagnostic printing' code was here in earlier versions.)			
			}
			else if( this.s2[PART_YPOS+16*i] > 0.9 && this.s2[PART_YVEL+16*i] > 0.0) { 		// collision! ceiling...
		      // ('diagnostic printing' code was here in earlier versions.)
				this.s2[PART_YPOS+16*i] = 0.9;					// 1) resolve contact: put particle at wall.
																// 2) remove all y velocity gained from forces as
																// ball moved thru ceiling in this timestep. HOW?
																// Assume ball reached ceiling at START of
																// the timestep, thus: return to the orig.
				this.s2[PART_YVEL+16*i] *= this.drag;			
				                        // **BUT** reduced by drag (and any other forces 
																// 	that still apply during this timestep),
																// 3) BOUNCE:  
																//reversed velocity*coeff-of-restitution.
				if(this.s2[PART_YVEL+16*i] > 0.0) 
				    this.s2[PART_YVEL+16*i] = -this.resti * this.s2[PART_YVEL+16*i]; // no sign change--bounce!
				else 
				    this.s2[PART_YVEL+16*i] =  this.resti * this.s2[PART_YVEL+16*i];	// sign changed-- don't need another.
		      // ('diagnostic printing' code was here in earlier versions.)
			}
			if( this.s2[PART_ZPOS+16*i] < 0.0 && this.s2[PART_ZVEL+16*i] < 0.0) {		// collision! floor...
				// ('diagnostic printing' code was here in earlier versions.)

			  this.s2[PART_ZPOS+16*i] = 0.0;					// 1) resolve contact: put particle at wall.
															  // 2) remove all y velocity gained from forces as
															  // ball moved thru floor in this timestep. HOW?
															  // Assume ball reached floor at START of
															  // the timestep, thus: return to the orig.
			  this.s2[PART_ZVEL+16*i] *= this.drag;			
									  // **BUT** reduced by drag (and any other forces 
															  // 	that still apply during this timestep).
															  // 3) BOUNCE:  
															  //reversed velocity*coeff-of-restitution.
			  // ATTENTION! VERY SUBTLE PROBLEM HERE! ------------------------------
			  //Balls with tiny, near-zero velocities (e.g. ball nearly at rest on 
			  // floor) can easily reverse sign between 'previous' and 'now' 
			  // timesteps, even for negligible forces.  Put another way:
			  // Step 2), our 'repair' attempt that removes all erroneous x velocity, 
			  // has CHANGED the 'now' ball velocity, and MAY have changed its sign as 
			  // well,  especially when the ball is nearly at rest. SUBTLE: THUS we 
			  // need a velocity-sign test here that ensures the 'bounce' step will 
			  // always send the ball outwards, away from its wall or floor collision. 
			  if(this.s2[PART_ZVEL+16*i] < 0.0) 
				  this.s2[PART_ZVEL+16*i] = -this.resti * this.s2[PART_ZVEL+16*i]; // no sign change--bounce!
			  else 
				  this.s2[PART_ZVEL+16*i] =  this.resti * this.s2[PART_ZVEL+16*i];	// sign changed-- don't need another.
			// ('diagnostic printing' code was here in earlier versions.)			
		  }
		  else if( this.s2[PART_ZPOS+16*i] > 1.8 && this.s2[PART_ZVEL+16*i] > 0.0) { 		// collision! ceiling...
			// ('diagnostic printing' code was here in earlier versions.)
			  this.s2[PART_ZPOS+16*i] = 1.8;					// 1) resolve contact: put particle at wall.
															  // 2) remove all y velocity gained from forces as
															  // ball moved thru ceiling in this timestep. HOW?
															  // Assume ball reached ceiling at START of
															  // the timestep, thus: return to the orig.
			  this.s2[PART_ZVEL+16*i] *= this.drag;			
									  // **BUT** reduced by drag (and any other forces 
															  // 	that still apply during this timestep),
															  // 3) BOUNCE:  
															  //reversed velocity*coeff-of-restitution.
			  if(this.s2[PART_ZVEL+16*i] > 0.0) 
				  this.s2[PART_ZVEL+16*i] = -this.resti * this.s2[PART_ZVEL+16*i]; // no sign change--bounce!
			  else 
				  this.s2[PART_ZVEL+16*i] =  this.resti * this.s2[PART_ZVEL+16*i];	// sign changed-- don't need another.
			// ('diagnostic printing' code was here in earlier versions.)
		  }
		  if((this.s2[PART_XPOS+16*i]>0.55 && this.s2[PART_XVEL+16*i]<0.0)&&(this.s2[PART_YPOS+16*i]>-0.6 && this.s2[PART_YPOS+16*i]<-0.2)&&(this.s2[PART_ZPOS+16*i]>1.0 && this.s2[PART_ZPOS+16*i]<1.4)){
			  if(this.s2[PART_XPOS+16*i]<0.65){
			  	this.s2[PART_XPOS+16*i] = 0.65;
			  	this.s2[PART_XVEL+16*i] *= -this.drag*this.resti;	
			  }
		  }
		  else if((this.s2[PART_XPOS+16*i]<0.25 && this.s2[PART_XVEL+16*i]>0.0)&&(this.s2[PART_YPOS+16*i]>-0.6 && this.s2[PART_YPOS+16*i]<-0.2)&&(this.s2[PART_ZPOS+16*i]>1.0 && this.s2[PART_ZPOS+16*i]<1.4)){
				if(this.s2[PART_XPOS+16*i]>0.15){
			  	this.s2[PART_XPOS+16*i] = 0.15;
			  	this.s2[PART_XVEL+16*i] *= -this.drag*this.resti;	
			  }
		  }
		  if((this.s2[PART_XPOS+16*i]<0.6 && this.s2[PART_XPOS+16*i]>0.2)&&(this.s2[PART_YPOS+16*i]<-0.55 && this.s2[PART_YVEL+16*i]>0.0)&&(this.s2[PART_ZPOS+16*i]>1.0 && this.s2[PART_ZPOS+16*i]<1.4)){
			  if(this.s2[PART_YPOS+16*i]>-0.65){
			  	this.s2[PART_YPOS+16*i] = -0.65;
			  	this.s2[PART_YVEL+16*i] *= -this.drag*this.resti;	
			  }
		  }
		  else if((this.s2[PART_XPOS+16*i]<0.6 && this.s2[PART_XPOS+16*i]>0.2)&&(this.s2[PART_YPOS+16*i]>-0.25 && this.s2[PART_YVEL+16*i]<0.0)&&(this.s2[PART_ZPOS+16*i]>1.0 && this.s2[PART_ZPOS+16*i]<1.4)){
				if(this.s2[PART_YPOS+16*i]<-0.15){
			  	this.s2[PART_YPOS+16*i] = -0.15;
			  	this.s2[PART_YVEL+16*i] *= -this.drag*this.resti;	
			  }
		  }
		  if((this.s2[PART_XPOS+16*i]<0.6 && this.s2[PART_XPOS+16*i]>0.2)&&(this.s2[PART_YPOS+16*i]>-0.6 && this.s2[PART_YPOS+16*i]<-0.2)&&(this.s2[PART_ZPOS+16*i]<1.05 && this.s2[PART_ZVEL+16*i]>0.0)){
			  if(this.s2[PART_ZPOS+16*i]>0.95){
			  	this.s2[PART_ZPOS+16*i] = 0.95;
			  	this.s2[PART_ZVEL+16*i] *= -this.drag*this.resti;	
			  }
		  }
		  else if((this.s2[PART_XPOS+16*i]<0.6 && this.s2[PART_XPOS+16*i]>0.2)&&(this.s2[PART_YPOS+16*i]>-0.6 && this.s2[PART_YPOS+16*i]<-0.2)&&(this.s2[PART_ZPOS+16*i]>1.35 && this.s2[PART_ZVEL+16*i]<0.0)){
				if(this.s2[PART_ZPOS+16*i]<1.45){
			  	this.s2[PART_ZPOS+16*i] = 1.45;
			  	this.s2[PART_ZVEL+16*i] *= -this.drag*this.resti;	
			  }
		  }
		  dis = Math.sqrt(Math.pow(this.s2[PART_XPOS+16*i]+0.4)+Math.pow(this.s2[PART_YPOS+16*i]-0.4))
		  if((dis<0.2)&&(this.s2[PART_ZPOS+16*i]<1.05 && this.s2[PART_ZVEL+16*i]>0.0)){
			  if(this.s2[PART_ZPOS+16*i]>0.95){
			  	this.s2[PART_ZPOS+16*i] = 0.95;
			  	this.s2[PART_ZVEL+16*i] *= -this.drag*this.resti;	
			  }
		  }
		  else if((dis<0.2)&&(this.s2[PART_ZPOS+16*i]>1.35 && this.s2[PART_ZVEL+16*i]<0.0)){
			  if(this.s2[PART_ZPOS+16*i]<1.45){
			  	this.s2[PART_ZPOS+16*i] = 1.45;
			  	this.s2[PART_ZVEL+16*i] *= -this.drag*this.resti;		
			  }
		  }
		  else if((dis<0.2)&&(this.s2[PART_ZPOS+16*i]<1.35 && this.s2[PART_ZPOS+16*i]>1.05)){
			  	this.s2[PART_ZVEL+16*i] *= -this.drag*this.resti;	
			  	this.s2[PART_XVEL+16*i] *= -this.drag*this.resti;	
			  	this.s2[PART_YVEL+16*i] *= -this.drag*this.resti;	
		  }

	return this;
}
PartSys.prototype.Wind = function(i){
	var x1 = this.s1[PART_XPOS+i*16];
	var y1 = this.s1[PART_YPOS+i*16];
	var z1 = this.s1[PART_ZPOS+i*16];
	var dis = Math.sqrt(Math.pow(x1-0,2)+Math.pow(y1-0,2));

	if(dis > 0.1){
		var forceX = Math.sqrt(Math.pow(x1,2)*0.1/(Math.pow(x1,2)+Math.pow(y1,2)))*(1.65-z1);
		var forceY = Math.sqrt(Math.pow(y1,2)*0.1/(Math.pow(x1,2)+Math.pow(y1,2)))*(1.65-z1);

		if(x1>0){
			this.s1[PART_X_FTOT+i*16] -= forceX;
		}
		else{
			this.s1[PART_X_FTOT+i*16] += forceX;
		}
		if(y1>0){
			this.s1[PART_Y_FTOT+i*16] -= forceY;
		}
		else{
			this.s1[PART_Y_FTOT+i*16] += forceY;
		}

		var forceX2 = Math.sqrt(Math.pow(y1,2)*0.35*(2*Math.sqrt(2)-dis)/(Math.pow(x1,2)+Math.pow(y1,2)));
		var forceY2 = Math.sqrt(Math.pow(x1,2)*0.35*(2*Math.sqrt(2)-dis)/(Math.pow(x1,2)+Math.pow(y1,2)));

		if(x1>0){
			this.s1[PART_Y_FTOT+i*16] -= forceY2;
		}
		else{
			this.s1[PART_Y_FTOT+i*16] += forceY2;
		}
		if(y1>0){
			this.s1[PART_X_FTOT+i*16] += forceX2;
		}
		else{
			this.s1[PART_X_FTOT+i*16] -= forceX2;
		}
		
		var forcez = 4.5*(2*Math.sqrt(2)-dis);
		this.s1[PART_Z_FTOT+i*16] += forcez;

	}
	return this;
}

PartSys.prototype.cohesion = function(){
	for(var i=this.partCount[0]+this.partCount[1]; i<this.partCount[0]+this.partCount[1]+this.partCount[2]; i++){
		var local = [];
		var x1 = this.s1[PART_XPOS+i*16];
		var y1 = this.s1[PART_YPOS+i*16];
		var z1 = this.s1[PART_ZPOS+i*16];
		var xVel1 = this.s1[PART_XVEL+i*16];
		var yVel1 = this.s1[PART_YVEL+i*16];
		var zVel1 = this.s1[PART_ZVEL+i*16];
		var VelVec = [xVel1, yVel1, zVel1];
		for(var j=this.partCount[0]+this.partCount[1]; j<this.partCount[0]+this.partCount[1]+this.partCount[2]; j++){
			if(i==j) continue;
			var x2 = this.s1[PART_XPOS + j*16];
			var y2 = this.s1[PART_YPOS + j*16];
			var z2 = this.s1[PART_ZPOS + j*16];
			var xVel2 = this.s1[PART_XVEL+j*16];
			var yVel2 = this.s1[PART_YVEL+j*16];
			var zVel2 = this.s1[PART_ZVEL+j*16];
			var PosVec = [x2-x1,y2-y1,z2-z1];
			var cos = VelVec[0]*PosVec[0]+VelVec[1]*PosVec[1]+VelVec[2]*PosVec[2]/(Math.sqrt(Math.pow(VelVec[0],2)+Math.pow(VelVec[1],2)+Math.pow(VelVec[2],2))*Math.sqrt(Math.pow(PosVec[0],2)+Math.pow(PosVec[1],2)+Math.pow(PosVec[2],2)))
			var dis = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2))
			if(dis < cohesion_dis && cos > 0){
				local.push(j)
			}
		}
		if(local.length>0){
			var xLocal = 0;
			var yLocal = 0;
			var zLocal = 0;
			var xLocalf = 0;
			var yLocalf = 0;
			var zLocalf = 0;
			for(var k=0; k<local.length;k++){
				xLocal += this.s1[PART_XPOS + local[k]*16];
				yLocal += this.s1[PART_YPOS + local[k]*16];
				zLocal += this.s1[PART_ZPOS + local[k]*16];
				var xVel2 = this.s1[PART_XVEL + local[k]*16];
				var yVel2 = this.s1[PART_YVEL + local[k]*16];
				var zVel2 = this.s1[PART_ZVEL + local[k]*16];
				xLocalf = xLocal + xVel2 * 0.001;
				yLocalf = yLocal + yVel2 * 0.001;
				zLocalf = zLocal + zVel2 * 0.001;
			}
			xLocal /= local.length;
			yLocal /= local.length;
			zLocal /= local.length;
			xLocalf /= local.length;
			yLocalf /= local.length;
			zLocalf /= local.length;
			var xLocalh = xLocal + xVel1 * 0.001;
			var yLocalh = xLocal + yVel1 * 0.001;
			var zLocalh = xLocal + zVel1 * 0.001;
			var cohesion_force = cohesion_damping;
			var sum = Math.pow(x1-xLocal,2)+Math.pow(y1-yLocal,2)+Math.pow(z1-zLocal,2);
			var sum2 = Math.pow(xLocalh-xLocalf,2)+Math.pow(yLocalh-yLocalf,2)+Math.pow(zLocalh-zLocalf,2);
			var forceX = 0;
			var forceY = 0;
			var forceZ = 0;
			if(sum>0.04 && sum2 > sum){
				forceX = Math.sqrt(Math.pow(cohesion_force,2) * Math.pow(x1-xLocal,2) / sum) * sum;
				forceY = Math.sqrt(Math.pow(cohesion_force,2) * Math.pow(y1-yLocal,2) / sum) * sum;
			    forceZ = Math.sqrt(Math.pow(cohesion_force,2) * Math.pow(z1-zLocal,2) / sum) * sum;
			}
			if(x1 > xLocal){
				this.s1[PART_X_FTOT+i*16] -= forceX;
			}
			else{
				this.s1[PART_X_FTOT+i*16] += forceX;
			}
			if(y1 > yLocal){
				this.s1[PART_Y_FTOT+i*16] -= forceY;
			}
			else{
				this.s1[PART_Y_FTOT+i*16] += forceY;
			}
			if(z1 > zLocal){
				this.s1[PART_Z_FTOT+i*16] -= forceZ;
			}
			else{
				this.s1[PART_Z_FTOT+i*16] += forceZ;
			}
		}
	}
	return this;
}

PartSys.prototype.separation = function(){
	for(var i=this.partCount[0]+this.partCount[1]; i<this.partCount[0]+this.partCount[1]+this.partCount[2]; i++){
		for(var j=i+1; j<this.partCount[0]+this.partCount[1]+this.partCount[2]; j++){
			var x1 = this.s1[PART_XPOS+i*16];
			var y1 = this.s1[PART_YPOS+i*16];
			var z1 = this.s1[PART_ZPOS+i*16];
			var x2 = this.s1[PART_XPOS + j*16];
			var y2 = this.s1[PART_YPOS + j*16];
			var z2 = this.s1[PART_ZPOS + j*16];

			var velX1 = this.s1[PART_XVEL+i*16];
			var velY1 = this.s1[PART_YVEL+i*16];
			var velZ1 = this.s1[PART_ZVEL+i*16];
			var velX2 = this.s1[PART_XVEL+j*16];
			var velY2 = this.s1[PART_YVEL+j*16];
			var velZ2 = this.s1[PART_ZVEL+j*16];

			var vec1to2 = [x2-x1,y2-y1,z2-z1];
			var vec2to1 = [x1-x2,y1-y2,z1-z2];

			var cos1 = velX1*vec1to2[0] +velY1*vec1to2[1] +velZ1*vec1to2[2]/ (Math.sqrt(Math.pow(velX1, 2) + Math.pow(velY1, 2) + Math.pow(velZ1, 2)) * Math.sqrt(Math.pow(vec1to2[0], 2) + Math.pow(vec1to2[1], 2) + Math.pow(vec1to2[2], 2)));
			var cos2 = velX2*vec2to1[0] +velY2*vec2to1[1] +velZ2*vec2to1[2]/ (Math.sqrt(Math.pow(velX2, 2) + Math.pow(velY2, 2) + Math.pow(velZ2, 2)) * Math.sqrt(Math.pow(vec2to1[0], 2) + Math.pow(vec2to1[1], 2) + Math.pow(vec2to1[2], 2)));

			var dis = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2))
			if(dis < separate_dis){
				var separate_force = separate_damping;
				var forceX = Math.sqrt(Math.pow(separate_force,2) * Math.pow(x1-x2,2) / (Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)))
				var forceY = Math.sqrt(Math.pow(separate_force,2) * Math.pow(y1-y2,2) / (Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)))
				var forceZ = Math.sqrt(Math.pow(separate_force,2) * Math.pow(z1-z2,2) / (Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)))
				if(x1 > x2){
					if(cos1 > 0)
						this.s1[PART_X_FTOT+i*16] += forceX;
					if(cos2 > 0)
						this.s1[PART_X_FTOT + j*16] -= forceX;
				}
				else{
					if(cos1 > 0)
						this.s1[PART_X_FTOT+i*16] -= forceX;
					if(cos2 > 0)
						this.s1[PART_X_FTOT + j*16] += forceX;
				}
				if(y1 > y2){
					if(cos1 > 0)
						this.s1[PART_Y_FTOT+i*16] += forceY;
					if(cos2 > 0)
						this.s1[PART_Y_FTOT + j*16] -= forceY;
				}
				else{
					if(cos1 > 0)
						this.s1[PART_Y_FTOT+i*16] -= forceY;
					if(cos2 > 0)
						this.s1[PART_Y_FTOT + j*16] += forceY;
				}
				if(z1 > z2){
					if(cos1 > 0)
						this.s1[PART_Z_FTOT+i*16] += forceZ;
					if(cos2 > 0)
						this.s1[PART_Z_FTOT + j*16] -= forceZ;
				}
				else{
					if(cos1 > 0)
						this.s1[PART_Z_FTOT+i*16] -= forceZ;
					if(cos2 > 0)
						this.s1[PART_Z_FTOT + j*16] += forceZ;
				}
			}
		}
	}
	return this;
}

PartSys.prototype.alignment = function(){
	for(var i=this.partCount[0]+this.partCount[1]; i<this.partCount[0]+this.partCount[1]+this.partCount[2]; i++){
		var local = [];
		var x1 = this.s1[PART_XPOS+i*16];
		var y1 = this.s1[PART_YPOS+i*16];
		var z1 = this.s1[PART_ZPOS+i*16];
		var xVel1 = this.s1[PART_XVEL+i*16];
		var yVel1 = this.s1[PART_YVEL+i*16];
		var zVel1 = this.s1[PART_ZVEL+i*16];
		var VelVec = [xVel1, yVel1, zVel1];
		for(var j=this.partCount[0]+this.partCount[1]; j<this.partCount[0]+this.partCount[1]+this.partCount[2]; j++){
			if(i==j) continue;
			var x2 = this.s1[PART_XPOS + j*16];
			var y2 = this.s1[PART_YPOS + j*16];
			var z2 = this.s1[PART_ZPOS + j*16];
			var PosVec = [x2-x1,y2-y1,z2-z1];
			var cos = VelVec[0]*PosVec[0]+VelVec[1]*PosVec[1]+VelVec[2]*PosVec[2]/(Math.sqrt(Math.pow(VelVec[0],2)+Math.pow(VelVec[1],2)+Math.pow(VelVec[2],2))*Math.sqrt(Math.pow(PosVec[0],2)+Math.pow(PosVec[1],2)+Math.pow(PosVec[2],2)))
			var dis = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2))
			if(dis < alignment_dis && cos > 0){
				local.push(j)
			}
		}
		if(local.length>0){
			var vx1 = this.s1[PART_XVEL+i*16];
			var vy1 = this.s1[PART_YVEL+i*16];
			var vz1 = this.s1[PART_ZVEL+i*16];
			var vel1 = Math.sqrt(Math.pow(vx1,2)+Math.pow(vy1,2)+Math.pow(vz1,2))
			var normalVx1 = 0;
			var normalVy1 = 0;
			var normalVz1 = 0;
			if(vel1 != 0){
				normalVx1 = vx1/vel1;
				normalVy1 = vy1/vel1;
				normalVz1 = vz1/vel1;
			}
			var normalVxLocal = 0;
			var normalVyLocal = 0;
			var normalVzLocal = 0;
			for(var k=0; k<local.length;k++){
				var vx2 = this.s1[PART_XVEL + local[k]*16];
				var vy2 = this.s1[PART_YVEL + local[k]*16];
				var vz2 = this.s1[PART_ZVEL + local[k]*16];
				var vel2 = Math.sqrt(Math.pow(vx2,2)+Math.pow(vy2,2)+Math.pow(vz2,2))
				var	normalVx2 = 0;
				var	normalVy2 = 0;
				var	normalVz2 = 0;
				if(vel2 != 0){
					normalVx2 = vx2/vel2;
					normalVy2 = vy2/vel2;
					normalVz2 = vz2/vel2;
				}
				normalVxLocal += normalVx2;
				normalVyLocal += normalVy2;
				normalVzLocal += normalVz2;
			}
			normalVxLocal /= local.length;
			normalVyLocal /= local.length;
			normalVzLocal /= local.length;
			var alignment_force = alignment_damping;
			var sum = Math.pow(normalVx1-normalVxLocal,2)+Math.pow(normalVy1-normalVyLocal,2)+Math.pow(normalVz1-normalVzLocal,2);
			forceX = 0;
			forceY = 0;
			forceZ = 0;
			if(sum > 0){
				forceX = Math.sqrt(Math.pow(alignment_force,2) * Math.pow(normalVx1-normalVxLocal,2) / sum)
				forceY = Math.sqrt(Math.pow(alignment_force,2) * Math.pow(normalVy1-normalVyLocal,2) / sum)
				forceZ = Math.sqrt(Math.pow(alignment_force,2) * Math.pow(normalVz1-normalVzLocal,2) / sum)
			}
			if(normalVx1 > normalVxLocal){
				this.s1[PART_X_FTOT+i*16] -= forceX;
			}
			else{
				this.s1[PART_X_FTOT+i*16] += forceX;
			}
			if(normalVy1 > normalVyLocal){
				this.s1[PART_Y_FTOT+i*16] -= forceY;
			}
			else{
				this.s1[PART_Y_FTOT+i*16] += forceY;
			}
			if(normalVz1 > normalVzLocal){
				this.s1[PART_Z_FTOT+i*16] -= forceZ;
			}
			else{
				this.s1[PART_Z_FTOT+i*16] += forceZ;
			}
		}
	}
	return this;
}

PartSys.prototype.evasion = function(){
	for(var i=this.partCount[0]+this.partCount[1]; i<this.partCount[0]+this.partCount[1]+this.partCount[2]; i++){
		var x1 = this.s1[PART_XPOS+i*16];
		var y1 = this.s1[PART_YPOS+i*16];
		var z1 = this.s1[PART_ZPOS+i*16];
		var xVel1 = this.s1[PART_XVEL+i*16];
		var yVel1 = this.s1[PART_YVEL+i*16];
		var zVel1 = this.s1[PART_ZVEL+i*16];
		var vel = Math.sqrt(Math.pow(xVel1, 2) + Math.pow(yVel1, 2) + Math.pow(zVel1, 2));
		if((x1 <- 2 && xVel1 < 0) || (x1 > 2 && xVel1 > 0)){
			var divider = Math.pow(yVel1, 2) + Math.pow(zVel1, 2);
			var newYvel = 0;
			var newZvel = 0;
			if(divider != 0){
				newYVel = vel * Math.sqrt(Math.pow(yVel1, 2) / divider);
				newZVel = vel * Math.sqrt(Math.pow(zVel1, 2) / divider);
			}
			else{
				newYVel = vel * Math.sqrt(0.5);
				newZVel = vel * Math.sqrt(0.5);
			}
			if(x1 <- 2 && xVel1 < 0){
				this.s1[PART_XPOS+i*16] = -2;
				this.s2[PART_XPOS+i*16] = -2;
				this.s1[PART_XVEL+i*16] = 0.1;
				this.s2[PART_XVEL+i*16] = 0.1;
			}
			else{
				this.s1[PART_XPOS+i*16] = 2;
				this.s2[PART_XPOS+i*16] = 2;
				this.s1[PART_XVEL+i*16] = -0.1;
				this.s2[PART_XVEL+i*16] = -0.1;
			}

			if(yVel1 >= 0 && y1 < 1.5){
				this.s1[PART_YVEL+i*16] = newYVel;
				this.s2[PART_YVEL+i*16] = newYVel;
			}
			else if(yVel1 < 0 && y1 > -1.5){
				this.s1[PART_YVEL+i*16] = -newYVel;
				this.s2[PART_YVEL+i*16] = -newYVel;
			}
			else if(y1 >= 1.5){
				this.s1[PART_YVEL+i*16] = -newYVel;
				this.s2[PART_YVEL+i*16] = -newYVel;
			}
			else if(y1 <= -1.5){
				this.s1[PART_YVEL+i*16] = newYVel;
				this.s2[PART_YVEL+i*16] = newYVel;
			}
			
			if(zVel1 >= 0 && z1 < 1.5){
				this.s1[PART_ZVEL+i*16] = newZVel;
				this.s2[PART_ZVEL+i*16] = newZVel;
			}
			else if(zVel1 < 0 && z1 > -1.5){
				this.s1[PART_ZVEL+i*16] = -newZVel;
				this.s2[PART_ZVEL+i*16] = -newZVel;
			}
			else if(z1 >= 1.5){
				this.s1[PART_ZVEL+i*16] = -newZVel;
				this.s2[PART_ZVEL+i*16] = -newZVel;
			}
			else if(z1 <= -1.5){
				this.s1[PART_ZVEL+i*16] = newZVel;
				this.s2[PART_ZVEL+i*16] = newZVel;
			}
		}

		if((y1 <- 2 && yVel1 < 0) || (y1 > 2 && yVel1 > 0)){
			var divider = Math.pow(zVel1, 2) + Math.pow(xVel1, 2);
			var newXVel = 0;
			var newZVel = 0;
			if(divider != 0){
				newXVel = vel * Math.sqrt(Math.pow(xVel1, 2) / divider);
				newZVel = vel * Math.sqrt(Math.pow(zVel1, 2) / divider);
			}
			else{
				newXVel = vel * Math.sqrt(0.5);
				newZVel = vel * Math.sqrt(0.5);
			}
			if(y1 <- 2 && yVel1 < 0){
				this.s1[PART_YPOS+i*16] = -2;
				this.s2[PART_YPOS+i*16] = -2;
				this.s1[PART_YVEL+i*16] = 0.1;
				this.s2[PART_YVEL+i*16] = 0.1;
			}
			else{
				this.s1[PART_YPOS+i*16] = 2;
				this.s2[PART_YPOS+i*16] = 2;
				this.s1[PART_YVEL+i*16] = -0.1;
				this.s2[PART_YVEL+i*16] = -0.1;
			}

			if(xVel1 >= 0 && x1 < 1.5){
				this.s1[PART_XVEL+i*16] = newXVel;
				this.s2[PART_XVEL+i*16] = newXVel;
			}
			else if(xVel1 < 0 && x1 > -1.5){
				this.s1[PART_XVEL+i*16] = -newXVel;
				this.s2[PART_XVEL+i*16] = -newXVel;
			}
			else if(x1 >= 1.5){
				this.s1[PART_XVEL+i*16] = -newXVel;
				this.s2[PART_XVEL+i*16] = -newXVel;
			}
			else if(x1 <= -1.5){
				this.s1[PART_XVEL+i*16] = newXVel;
				this.s2[PART_XVEL+i*16] = newXVel;
			}

			if(zVel1 >= 0 && z1 < 1.5){
				this.s1[PART_ZVEL+i*16] = newZVel;
				this.s2[PART_ZVEL+i*16] = newZVel;
			}
			else if(zVel1 < 0 && z1 > -1.5){
				this.s1[PART_ZVEL+i*16] = -newZVel;
				this.s2[PART_ZVEL+i*16] = -newZVel;
			}
			else if(z1 >= 1.5){
				this.s1[PART_ZVEL+i*16] = -newZVel;
				this.s2[PART_ZVEL+i*16] = -newZVel;
			}
			else if(z1 <= -1.5){
				this.s1[PART_ZVEL+i*16] = newZVel;
				this.s2[PART_ZVEL+i*16] = newZVel;
			}
		}
		
		if((z1 <- 2 && zVel1 < 0) || (z1 > 2 && zVel1 > 0)){
			var divider = Math.pow(yVel1, 2) + Math.pow(xVel1, 2);
			var newXVel = 0;
			var newYVel = 0;
			if(divider != 0){
				newXVel = vel * Math.sqrt(Math.pow(xVel1, 2) / divider);
				newYVel = vel * Math.sqrt(Math.pow(yVel1, 2) / divider);
			}
			else{
				newXVel = vel * Math.sqrt(0.5);
				newYVel = vel * Math.sqrt(0.5);
			}
			if(z1 <- 2 && zVel1 < 0){
				this.s1[PART_ZPOS+i*16] = -2;
				this.s2[PART_ZPOS+i*16] = -2;
				this.s1[PART_ZVEL+i*16] = 0.1;
				this.s2[PART_ZVEL+i*16] = 0.1;
			}
			else{
				this.s1[PART_ZPOS+i*16] = 2;
				this.s2[PART_ZPOS+i*16] = 2;
				this.s1[PART_ZVEL+i*16] = -0.1;
				this.s2[PART_ZVEL+i*16] = -0.1;
			}

			if(xVel1 >= 0 && x1 < 1.5){
				this.s1[PART_XVEL+i*16] = newXVel;
				this.s2[PART_XVEL+i*16] = newXVel;
			}
			else if(xVel1 < 0 && x1 > -1.5){
				this.s1[PART_XVEL+i*16] = -newXVel;
				this.s2[PART_XVEL+i*16] = -newXVel;
			}
			else if(x1 >= 1.5){
				this.s1[PART_XVEL+i*16] = -newXVel;
				this.s2[PART_XVEL+i*16] = -newXVel;
			}
			else if(x1 <= -1.5){
				this.s1[PART_XVEL+i*16] = newXVel;
				this.s2[PART_XVEL+i*16] = newXVel;
			}

			if(yVel1 >= 0 && y1 < 1.5){
				this.s1[PART_YVEL+i*16] = newYVel;
				this.s2[PART_YVEL+i*16] = newYVel;
			}
			else if(yVel1 < 0 && y1 > -1.5){
				this.s1[PART_YVEL+i*16] = -newYVel;
				this.s2[PART_YVEL+i*16] = -newYVel;
			}
			else if(y1 >= 1.5){
				this.s1[PART_YVEL+i*16] = -newYVel;
				this.s2[PART_YVEL+i*16] = -newYVel;
			}
			else if(y1 <= -1.5){
				this.s1[PART_YVEL+i*16] = newYVel;
				this.s2[PART_YVEL+i*16] = newYVel;
			}
		}
	}
	return this;
}

PartSys.prototype.sprintForces = function(i){
	for(var j = 0; i-this.partCount[0]-this.partCount[1]-this.partCount[2] < 19 && j < lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]].length; j++){
		var x1 = this.s1[i*PART_MAXVAR+PART_XPOS];
		var y1 = this.s1[i*PART_MAXVAR+PART_YPOS];
		var z1 = this.s1[i*PART_MAXVAR+PART_ZPOS];
		var x2 = this.s1[PART_XPOS + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR];
		var y2 = this.s1[PART_YPOS + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR];
		var z2 = this.s1[PART_ZPOS + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR];
		var dis = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)).toFixed(5)
		var sprintForceTotal = sprint_damping * (dis-sprint_length)
		var forceX = Math.sqrt(Math.pow(sprintForceTotal,2) * Math.pow(x1-x2,2) / (Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)))
		var forceY = Math.sqrt(Math.pow(sprintForceTotal,2) * Math.pow(y1-y2,2) / (Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)))
		var forceZ = Math.sqrt(Math.pow(sprintForceTotal,2) * Math.pow(z1-z2,2) / (Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)))
		if (sprintForceTotal > 0){
			if(x1 > x2){
				this.s1[i*PART_MAXVAR+PART_X_FTOT] -= forceX;
				this.s1[PART_X_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceX;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_X_FTOT] += forceX;
				this.s1[PART_X_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceX;
			}
			if(y1 > y2){
				this.s1[i*PART_MAXVAR+PART_Y_FTOT] -= forceY;
				this.s1[PART_Y_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceY;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_Y_FTOT] += forceY;
				this.s1[PART_Y_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceY;
			}
			if(z1 > z2){
				this.s1[i*PART_MAXVAR+PART_Z_FTOT] -= forceZ;
				this.s1[PART_Z_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceZ;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_Z_FTOT] += forceZ;
				this.s1[PART_Z_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceZ;
			}
		}
		else{
			if(x1 > x2){
				this.s1[i*PART_MAXVAR+PART_X_FTOT] += forceX;
				this.s1[PART_X_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceX;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_X_FTOT] -= forceX;
				this.s1[PART_X_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceX;
			}
			if(y1 > y2){
				this.s1[i*PART_MAXVAR+PART_Y_FTOT] += forceY;
				this.s1[PART_Y_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceY;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_Y_FTOT] -= forceY;
				this.s1[PART_Y_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceY;
			}
			if(z1 > z2){
				this.s1[i*PART_MAXVAR+PART_Z_FTOT] += forceZ;
				this.s1[PART_Z_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceZ;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_Z_FTOT] -= forceZ;
				this.s1[PART_Z_FTOT + (lines[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][j]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceZ;
			}
		}
	}
	if(i-this.partCount[0]-this.partCount[1]-this.partCount[2] < 10){
		var x1 = this.s1[i*PART_MAXVAR+PART_XPOS];
		var y1 = this.s1[i*PART_MAXVAR+PART_YPOS];
		var z1 = this.s1[i*PART_MAXVAR+PART_ZPOS];
		var x2 = this.s1[PART_XPOS + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR];
		var y2 = this.s1[PART_YPOS + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR];
		var z2 = this.s1[PART_ZPOS + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR];
		var dis = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)).toFixed(5)
		var sprintForceTotal = sprint_damping * (dis-sprint_length2)
		var forceX = Math.sqrt(Math.pow(sprintForceTotal,2) * Math.pow(x1-x2,2) / (Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)))
		var forceY = Math.sqrt(Math.pow(sprintForceTotal,2) * Math.pow(y1-y2,2) / (Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)))
		var forceZ = Math.sqrt(Math.pow(sprintForceTotal,2) * Math.pow(z1-z2,2) / (Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2)))
		if (sprintForceTotal > 0){
			if(x1 > x2){
				this.s1[i*PART_MAXVAR+PART_X_FTOT] -= forceX;
				//this.s1[PART_X_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceX;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_X_FTOT] += forceX;
				//this.s1[PART_X_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceX;
			}
			if(y1 > y2){
				this.s1[i*PART_MAXVAR+PART_Y_FTOT] -= forceY;
				//this.s1[PART_Y_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceY;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_Y_FTOT] += forceY;
				//this.s1[PART_Y_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceY;
			}
			if(z1 > z2){
				this.s1[i*PART_MAXVAR+PART_Z_FTOT] -= forceZ;
				//this.s1[PART_Z_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceZ;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_Z_FTOT] += forceZ;
				//this.s1[PART_Z_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceZ;
			}
		}
		else{
			if(x1 > x2){
				this.s1[i*PART_MAXVAR+PART_X_FTOT] += forceX;
				//this.s1[PART_X_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceX;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_X_FTOT] -= forceX;
				//this.s1[PART_X_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceX;
			}
			if(y1 > y2){
				this.s1[i*PART_MAXVAR+PART_Y_FTOT] += forceY;
				//this.s1[PART_Y_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceY;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_Y_FTOT] -= forceY;
				//this.s1[PART_Y_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceY;
			}
			if(z1 > z2){
				this.s1[i*PART_MAXVAR+PART_Z_FTOT] += forceZ;
				//this.s1[PART_Z_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] -= forceZ;
			}
			else{
				this.s1[i*PART_MAXVAR+PART_Z_FTOT] -= forceZ;
				//this.s1[PART_Z_FTOT + (implicit_spring[i-this.partCount[0]-this.partCount[1]-this.partCount[2]][0]+this.partCount[0]+this.partCount[1]+this.partCount[2])*PART_MAXVAR] += forceZ;
			}
		}
	}
	return this;
}

function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([1.0, 1.0, 1.0]);	// dark gray
 var topColr = new Float32Array([1.0, 1.0, 1.0]);	// light green
 var botColr = new Float32Array([1.0, 1.0, 1.0]);	// light blue
 var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 1;		// radius of bottom of cylinder (top always 1.0)
  var floatsPerVertex = 7;
 
 // Create a (global) array to hold this cylinder's vertices;
 cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them.
 cylNors = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex); 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] = 1.0; 
			cylVerts[j+3] = 1.0;			// r,g,b = topColr[]
			cylVerts[j+4]=ctrColr[0]; 
			cylVerts[j+5]=ctrColr[1]; 
			cylVerts[j+6]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			cylVerts[j+2] = 1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=topColr[0]; 
			cylVerts[j+5]=topColr[1]; 
			cylVerts[j+6]=topColr[2];			
		}
			cylNors[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylNors[j+1] = 0.0;	
			cylNors[j+2] = 1.0; 
			cylNors[j+3] = 1.0;			// r,g,b = topColr[]
			cylNors[j+4]=ctrColr[0]; 
			cylNors[j+5]=ctrColr[1]; 
			cylNors[j+6]=ctrColr[2];
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
				cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				cylVerts[j+2] = 1.0;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=topColr[0]; 
				cylVerts[j+5]=topColr[1]; 
				cylVerts[j+6]=topColr[2];			
		}
		else		// position all odd# vertices along the bottom cap:
		{
				cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				cylVerts[j+2] =-1.0;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=botColr[0]; 
				cylVerts[j+5]=botColr[1]; 
				cylVerts[j+6]=botColr[2];			
		}
      cylNors[j  ] = Math.cos(Math.PI*(v-1)/capVerts); 			// x,y,z,w == 0,0,1,1
			cylNors[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);	
			cylNors[j+2] = 0.0; 
			cylNors[j+3] = 1.0;			// r,g,b = topColr[]
			cylNors[j+4]=ctrColr[0]; 
			cylNors[j+5]=ctrColr[1]; 
			cylNors[j+6]=ctrColr[2];
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] =-1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] =-1.0; 
			cylVerts[j+3] = 1.0;			// r,g,b = botColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];
		}
      cylNors[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylNors[j+1] = 0.0;	
			cylNors[j+2] = -1.0; 
			cylNors[j+3] = 1.0;			// r,g,b = topColr[]
			cylNors[j+4]=ctrColr[0]; 
			cylNors[j+5]=ctrColr[1]; 
			cylNors[j+6]=ctrColr[2];
	}
}