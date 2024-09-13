const root = document.documentElement;
const canvas = document.getElementById('canvas')
canvas.width = canvas.getBoundingClientRect().width
canvas.height = canvas.width
const canvas_ctx = canvas.getContext('2d');
// attaching the logic for creating all the dots to the pickers
var rows_picker = document.getElementById('rows')
var cols_picker = document.getElementById('cols')
var refresh_button = document.getElementById('refresh')

var grid_window = document.getElementById('grid-window')
const grid_window_bounds = grid_window.getBoundingClientRect();

var color_unclicked = 'rgb(221, 182, 224)'
var color_clicked = 'rgb(108, 148, 111)'


let dot_radius;
let min_x;
let min_y;
let max_x;
let max_y;
let x_diff;
let y_diff;

function create_grid(){
    refresh_button.setAttribute('fill', '#80C4E9')
    
    // clearing the current grid
    console.log("removing current grid");
    while(grid_window.lastChild){
        grid_window.removeChild(grid_window.lastChild)
    }
    
    // adding all the dots
    console.log("adding dots")
    console.log(rows_picker.value)
    console.log(cols_picker.value)
    for(let r = 0; r < rows_picker.value; r++){
        let cur_html_row = document.createElement('div');
        cur_html_row.classList.add('grid-row');
        grid_window.appendChild(cur_html_row)
        for(let c = 0; c < cols_picker.value; c++){
            let dot = document.createElement('button')
            dot.classList.add('dot');
            dot.style.backgroundColor = color_unclicked
            dot.onclick = function() {flipButton(r,c)}
            dot.id = 'dot-' + r + '_' + c;
            cur_html_row.appendChild(dot);
        }
    }
    // also grabbing the x and y of the top left and bottom right dots to make finding the points easier
    let top_left_dot = document.getElementById('dot-0_0');
    let bot_right_dot = document.getElementById('dot-' + (rows_picker.value - 1) + '_' + (cols_picker.value - 1))

    let top_left_bounding = top_left_dot.getBoundingClientRect();
    let bot_right_bounding = bot_right_dot.getBoundingClientRect();

    // all of them are going to be measured from the center of the circle
    dot_radius = top_left_bounding.width / 2;

    min_x = top_left_bounding.left;
    min_y = top_left_bounding.top;
    max_x = bot_right_bounding.left;
    max_y = bot_right_bounding.top;

    console.log('min: ' + [min_x, min_y])
    console.log('max: ' + [max_x, max_y])

    // distance between dots
    x_diff = (max_x - min_x) / (cols_picker.value - 1)
    y_diff = (max_y - min_y) / (rows_picker.value - 1)
    
    refresh_button.setAttribute('fill', '#FF7F3E')
}
function flipButton(r, c){
    let dot_id = 'dot-'+ r + '_' + c
    console.log("trying to flip " + dot_id)
    let dot = document.getElementById(dot_id);
    if(color_unclicked === dot.style.backgroundColor){
        dot.style.backgroundColor = color_clicked
    }else{
        dot.style.backgroundColor = color_unclicked
    }
}

rows_picker.onchange = create_grid;
cols_picker.onchange = create_grid;
refresh_button.onclick = create_grid
create_grid()


// adding functionality to update dot size
var dot_size_picker = document.getElementById('dot-size')
dot_size_picker.onchange = function() {
    root.style.setProperty('--dot-size', dot_size_picker.value + 'vmin')
    // need to remake the grid too
    create_grid()
}

// adding tracking of bubble mode
var bubble_mode_picker = document.getElementById('bubble-enabled')
bubble_mode_picker.onchange = function(){
    console.log(bubble_mode_picker.checked)
    // if(bubble_mode_picker.checked){
    //     bubble_mode_picker.text = '✔'
    // }else{
    //     bubble_mode_picker.text = '✘'
    // }

    // TODO: make this so it actually enables or disables the overlay
}

let close_dot;
onmousemove = function(e){
    if(bubble_mode_picker.checked){    
        // console.log("mouse location:", e.clientX, e.clientY)

        // finding which is the closest dot
        let col = (e.clientX - min_x - dot_radius) / x_diff;
        let row = (e.clientY - min_y - dot_radius) / y_diff;
        // console.log("closest dot: " + [row, col]);

        // rounding it and clamping it to reasonable values [0, # cols/rows - 1]
        col = Math.max(Math.min(Math.round(col), cols_picker.value - 1),0);
        row = Math.max(Math.min(Math.round(row), rows_picker.value - 1),0);

        // console.log("closest dot (clamped): " + [row, col])
        let new_close_dot = document.getElementById('dot-' + row + '_' + col);
        if(new_close_dot != close_dot){
            // // new close dot
            // if(close_dot){
            //     close_dot.classList.remove('closest');
            // }
            // new_close_dot.classList.add('closest');
            close_dot = new_close_dot

            // we also need to draw a circle around the new closest dot

        }

        // time to fix the drawings
        
        let close_dot_bounds = close_dot.getBoundingClientRect();

        // clear the canvas
        canvas_ctx.clearRect(0, 0, canvas.width, canvas.height);

        // do we need to draw something aka is it on the grid?
        if(e.clientY >= grid_window_bounds.top){
            // console.log('drawing circle at ' + [close_dot_bounds.left + dot_radius, close_dot_bounds.top + dot_radius])
            canvas_ctx.beginPath();
            canvas_ctx.arc(close_dot_bounds.left + dot_radius, close_dot_bounds.top + dot_radius, dot_radius * 1.2, 0, 2 * Math.PI);
            canvas_ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            canvas_ctx.fill();
        
            // we draw another circle around the mouse
            
            // we draw one circle around the dot
            let distance = Math.sqrt((close_dot_bounds.left + dot_radius - e.clientX)**2 + (close_dot_bounds.top + dot_radius - e.clientY)**2)
        
            canvas_ctx.beginPath();
            canvas_ctx.arc(e.clientX, e.clientY, (distance + dot_radius), 0, 2 * Math.PI);
            canvas_ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            canvas_ctx.fill();
        
            // display_grid()
        }
    }else{
        canvas_ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

onclick = function(e){
    console.log(e);
    // are we in bubble mode, is the click in the right area, are we double clicking?
    if(bubble_mode_picker.checked && e.clientY >= grid_window_bounds.top && !e.target.classList.contains('dot')){
        // we are clicking on the grid window click the nearest button
        console.log(close_dot)
        close_dot.click()
    }
}

function display_grid(){
    for(let x = 0; x < canvas.getBoundingClientRect().right; x+=50){
        for(let y = 0; y < canvas.getBoundingClientRect().bottom; y+=50){
            canvas_ctx.beginPath();
            canvas_ctx.fillText(''+ [x,y], x,y)
            canvas_ctx.stroke();
            
        }
    }
}