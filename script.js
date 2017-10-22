var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

// window resize event
window.addEventListener('resize', onWindowResize, false);

// how many cubes we have at the moment
var scene_objects = 0;

// total cubes added so far 
var scene_objects_added = 0;

var Previous_Cube_Clicked_Colour;
var Previous_Cube_Clicked;

var mouse = { x: 0, y: 0 };
var INTERSECTED;
// initialize object to perform world/screen calculations
var projector = new THREE.Projector();

// event listeners
document.addEventListener("mousemove", onDocumentMouseMove, false);
document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("keydown", onDocumentKeyDown, false);

function onDocumentKeyDown(event) {
    if (Previous_Cube_Clicked) {
        var keyCode = event.which;

        // up
        if (keyCode == 87) {
            Previous_Cube_Clicked.position.y += 1;
            // down
        } else if (keyCode == 83) {
            Previous_Cube_Clicked.position.y -= 1;
            // left
        } else if (keyCode == 65) {
            Previous_Cube_Clicked.position.x -= 1;
            // right
        } else if (keyCode == 68) {
            Previous_Cube_Clicked.position.x += 1;
            // in
        } else if (keyCode == 82) {
            Previous_Cube_Clicked.position.z -= 1;
            // out
        } else if (keyCode == 70) {
            Previous_Cube_Clicked.position.z += 1;
        }
    }
}

function add_cube() {
    var RandomX = Math.random() * (window.innerWidth / 2);
    var RandomY = Math.random() * (window.innerHeight / 2);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    var cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    cube.position.x = Math.random() * 3;
    cube.position.z = Math.random() * 3;
    cube.position.y = Math.random() * 3;

    scene_objects_added++;
    scene_objects++;

    cube.name = scene_objects_added;
}

function delete_active_cube() {
    if (Previous_Cube_Clicked) {
        var r = confirm("Are you sure you want to delete the active cube?");

        if (r == true) {
            document.getElementById("active_cube").innerHTML = "active cube = none";

            scene.remove(Previous_Cube_Clicked);

            scene_objects--;

            Previous_Cube_Clicked = null;
        }
    }
}

function set_cube_colour(picker) {
    if (Previous_Cube_Clicked) {
        var hex = parseInt(picker.toString(), 16);
        Previous_Cube_Clicked.material.color.setHex(hex);
        Previous_Cube_Clicked.currentHex = hex;
        Previous_Cube_Clicked_Colour = hex;
    }
}

function original_camera() {
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 5;

    controls.update();
}

function animate() {
    requestAnimationFrame(animate);

    update();

    renderer.render(scene, camera);
}

function disable_check(id) {
    if (document.getElementById(id)) {
        var button_color_picker = document.getElementById(id);

        if (Previous_Cube_Clicked && button_color_picker.disabled == true) {
            button_color_picker.disabled = false;
        }
        else {
            if (!Previous_Cube_Clicked && button_color_picker.disabled == false) {
                button_color_picker.disabled = true;
            }
        }
    }
}

function update() {
    if (document.getElementById("cube_count"))
        document.getElementById("cube_count").innerHTML = "cube count = " + scene_objects;

    disable_check("colour_picker");
    disable_check("delete_cube_button");

    calculate_intersection();
}

function calculate_intersection() {
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);

    projector.unprojectVector(vector, camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = ray.intersectObjects(scene.children);

    // INTERSECTED = the object in the scene currently closest to the camera 
    //		and intersected by the Ray projected from the mouse position 	

    // if there is one (or more) intersections
    if (intersects.length > 0) {
        // if the closest object intersected is not the currently stored intersection object
        if (intersects[0].object != INTERSECTED) {
            // restore previous intersection object (if it exists) to its original color
            if (INTERSECTED)
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            // store reference to closest object as current intersection object
            INTERSECTED = intersects[0].object;
            if (Previous_Cube_Clicked != INTERSECTED)
                // store color of closest object (for later restoration)
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            // set a new color for closest object
            INTERSECTED.material.color.setHex(0xffff00);
        }
    }
    else // there are no intersections
    {
        // restore previous intersection object (if it exists) to its original color
        if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        // remove previous intersection object reference
        //     by setting current intersection object to "nothing"
        INTERSECTED = null;
    }
}

function onWindowResize() {
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
}

function scale_up() {
    scene.traverse(function (object) {
        object.scale.set(object.scale.x + 0.1, object.scale.y + 0.1, object.scale.z + 0.1);
    });
}

function scale_down() {
    scene.traverse(function (object) {
        object.scale.set(object.scale.x - 0.1, object.scale.y - 0.1, object.scale.z - 0.1);
    });
}

function default_size() {
    scene.traverse(function (object) {
        object.scale.set(1, 1, 1);
    });
}

function onDocumentMouseMove(event) {
    // update the mouse variable
    mouse.x = (event.clientX / (window.innerWidth / 2)) * 2 - 1;
    mouse.y = - (event.clientY / (window.innerHeight / 2)) * 2 + 1;
}

function onDocumentMouseDown(event) {

    if (INTERSECTED) {

        if (document.getElementById("active_cube"))
            document.getElementById("active_cube").innerHTML = "active cube = " + INTERSECTED.name;

        if (Previous_Cube_Clicked) {
            Previous_Cube_Clicked.material.color.setHex(Previous_Cube_Clicked_Colour);
        }

        // save details for new one
        if( INTERSECTED !=  Previous_Cube_Clicked){
            Previous_Cube_Clicked_Colour = INTERSECTED.currentHex;
            Previous_Cube_Clicked = INTERSECTED;
        }

        // set a new color for clicked object
        INTERSECTED.material.color.setHex(0xff0000);
        INTERSECTED.currentHex = 0xff0000;
    }
}

original_camera();
animate();
