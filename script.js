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

var previous_cube_clicked_colour;
var previous_cube_clicked;

var mouse = { x: 0, y: 0 };
var intersected;
// initialize object to perform world/screen calculations
var projector = new THREE.Projector();

// event listeners
document.addEventListener("mousemove", onDocumentMouseMove, false);
document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("keydown", onDocumentKeyDown, false);

function onDocumentKeyDown(event) {
    if (previous_cube_clicked) {
        var keyCode = event.which;

        // up
        if (keyCode == 87) {
            previous_cube_clicked.position.y += 1;
            // down
        } else if (keyCode == 83) {
            previous_cube_clicked.position.y -= 1;
            // left
        } else if (keyCode == 65) {
            previous_cube_clicked.position.x -= 1;
            // right
        } else if (keyCode == 68) {
            previous_cube_clicked.position.x += 1;
            // in
        } else if (keyCode == 82) {
            previous_cube_clicked.position.z -= 1;
            // out
        } else if (keyCode == 70) {
            previous_cube_clicked.position.z += 1;
        }
    }
}

function add_cube() {
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

    return "added";
}

function delete_active_cube() {
    if (previous_cube_clicked) {
        var r = confirm("Are you sure you want to delete the active cube?");

        if (r == true) {
            document.getElementById("active_cube").innerHTML = "active cube = none";

            scene.remove(previous_cube_clicked);

            scene_objects--;

            previous_cube_clicked = null;
        }
    }
}

function set_cube_colour(picker) {
    if (previous_cube_clicked) {
        var hex = parseInt(picker.toString(), 16);
        previous_cube_clicked.material.color.setHex(hex);
        previous_cube_clicked.currentHex = hex;
        previous_cube_clicked_colour = hex;
    }
}

function original_camera() {
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 5;

    controls.update();

    // return current camera position
    return Math.round(camera.position.x) + "," + Math.round(camera.position.y) + "," + Math.round(camera.position.z);
}

function animate() {
    requestAnimationFrame(animate);

    update();

    renderer.render(scene, camera);
}

function disable_check(id) {
    if (document.getElementById(id)) {
        var button_color_picker = document.getElementById(id);

        if (previous_cube_clicked && button_color_picker.disabled == true) {
            button_color_picker.disabled = false;
        }
        else {
            if (!previous_cube_clicked && button_color_picker.disabled == false) {
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
        if (intersects[0].object != intersected) {
            // restore previous intersection object (if it exists) to its original color
            if (intersected)
                intersected.material.color.setHex(intersected.currentHex);
            // store reference to closest object as current intersection object
            intersected = intersects[0].object;
            if (previous_cube_clicked != intersected)
                // store color of closest object (for later restoration)
                intersected.currentHex = intersected.material.color.getHex();
            // set a new color for closest object
            intersected.material.color.setHex(0xffff00);
        }
    }
    else // there are no intersections
    {
        // restore previous intersection object (if it exists) to its original color
        if (intersected)
            intersected.material.color.setHex(intersected.currentHex);
        // remove previous intersection object reference
        //     by setting current intersection object to "nothing"
        intersected = null;
    }
}

function onWindowResize() {
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
}

function scale_up() {
    var new_length; 
    var to_add = 0.1

    scene.traverse(function (object) {


        object.scale.set(object.scale.x + to_add, object.scale.y + to_add, object.scale.z + to_add);
        if( new_length != object.scale.x ){
            new_length = object.scale.x
        }
    });

    return new_length;
}

function scale_down() {
    var new_length; 
    var to_subtract = 0.1

    scene.traverse(function (object) {
        object.scale.set(object.scale.x - to_subtract, object.scale.y - to_subtract, object.scale.z - to_subtract);

        if( new_length != object.scale.x ){
            new_length = object.scale.x
        }
    });

    return new_length;
}

function default_size() {
    var new_value;

    scene.traverse(function (object) {
        object.scale.set(1, 1, 1);

        if(new_value != object.scale.x){
            new_value = object.scale.x;
        }
    });

    return new_value;
}

function onDocumentMouseMove(event) {
    // update the mouse variable
    mouse.x = (event.clientX / (window.innerWidth / 2)) * 2 - 1;
    mouse.y = - (event.clientY / (window.innerHeight / 2)) * 2 + 1;
}

function onDocumentMouseDown(event) {

    if (intersected) {

        if (document.getElementById("active_cube"))
            document.getElementById("active_cube").innerHTML = "active cube = " + intersected.name;

        if (previous_cube_clicked) {
            previous_cube_clicked.material.color.setHex(previous_cube_clicked_colour);
        }

        // save details for new one
        if( intersected !=  previous_cube_clicked){
            previous_cube_clicked_colour = intersected.currentHex;
            previous_cube_clicked = intersected;
        }

        // set a new color for clicked object
        intersected.material.color.setHex(0xff0000);
        intersected.currentHex = 0xff0000;
    }
}

original_camera();
animate();