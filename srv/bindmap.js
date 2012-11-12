// Depends on Keys.js loaded and Keys object existing
var app = {};
app.k_x = 70; // x dimension of key in pixels
app.k_y = 70; // x dimension of key in pixels
app.k_pad = 5; // pixels of padding
app.k_xp = app.k_x + 2*app.k_pad;
app.k_yp = app.k_y + 2*app.k_pad;

var defaultKeys = defaultKeys || null;
console.log(JSON.stringify(defaultKeys,null,2));
if(!defaultKeys){
  var state = null;
} else { 
  console.log('defaultKeys found');
  var state = defaultKeys;
};
/*var defaultKeysJSON = defaultKeysJSON || null;
if(!defaultKeysJSON){
  var state = null;
} else { 
  console.log('defaultKeys found');
  var state = JSON.parse(defaultKeysJSON);
};*/

Keys.init(state); // doesn't depend on DOM

// D3 builds models that react to changing data
// When a key is changed we will redraw

app.keyclicked = function(key){
  app.selected     = key;
  edit_n           = document.getElementById('editName');
  edit_label       = document.getElementById('editLabel');
  edit_description = document.getElementById('editDescription');
  edit_color       = document.getElementById('editColor');
  edit_n.value = key.name;
  edit_label.value = key.label;
  edit_description.value = key.description;
  edit_color.value = key.color;
  console.log('You clicked '+key.name);
  //app.update();  
  app.showEdit();
};
app.saveclicked = function(){
  key             = app.selected;
  key.label       = document.getElementById('editLabel').value;
  key.description = document.getElementById('editDescription').value;
  key.color       = document.getElementById('editColor').value;
  console.log('Saving '+key.name+':\n'+JSON.stringify(key,null,2));
  app.hideEdit();
  app.update();
};
app.update = function(){
  app.rows.forEach(function(row){
    row.selectAll('rect')
      .style('fill',function(d,i){ return d.color || 'white';})
      .style('stroke','black')
      .attr('width', function(d){return d.width*app.k_xp-2*app.k_pad})
      .attr('height',app.k_y)
      .attr('x',function(d,i){ return d.rect.x+app.k_pad;})
      .attr('y',app.k_pad)
      .attr('rx','4')
      .attr('ry','4')
      .on('click', function(){
        //console.log('This is:\n'+JSON.stringify(this,null,2));
        app.keyclicked(this.__data__);
      });

    row.selectAll('.keyname')
      .text(function(d){return d.name || ""})
      .attr('x', function(d){return d.rect.x+3*app.k_pad})
      .attr('y', app.k_yp-(app.k_yp*0.6));

    row.selectAll('.keylabel')
      .text(function(d){return d.label || ""})
      .attr('x', function(d){return d.rect.x+3*app.k_pad})
      .attr('y', app.k_yp-(app.k_yp*0.2));
  });

//  app.rows[0].selectAll('text')
//    .data(Keys.keyboard[0]);
};

app.showEdit = function(){
  edit = document.getElementById('edit');
  edit.style.display = 'block';
};

app.hideEdit = function(){
  edit = document.getElementById('edit');
  edit.style.display = 'none';
  app.hidePalette();
};

app.showPalette = function(){
  palette = document.getElementById('editPalette');
  palette.style.display = 'block';
};

app.hidePalette = function(){
  palette = document.getElementById('editPalette');
  palette.style.display = 'none';
};

app.init = function(e){
//  console.log(JSON.stringify(Keys.keyboard));
  app.rows = []; // will contain array of d3 svg's

  // Preprocess default key information
  Keys.keyboard.forEach(function(row,i,keyboard2){
    // Calculate key positions
    row.forEach(function(key,j,row2){
      key.rect={};
      if(j==0){
        key.rect.x = 0;
      } else {
        var _p = row2[j-1];
        key.rect.x = _p.rect.x+(app.k_xp*_p.width);
      };
      key.rect.y = app.k_pad;
    });


    // Create an SVG for this row of keys
    var tmp = d3.select('#keyboard')
      .append('svg')
      .attr('width', 15*app.k_xp)
      .attr('height', app.k_yp)
      .style('display','block');
    app.rows.push(tmp); // save svg for later d3 use
  });

//  console.log('Keys.keyboard after init:\n'+JSON.stringify(Keys.keyboard,null,2));
  // we now have one empty svg per row
  // bind Keys.keyboard data to row svg's

  app.rows.forEach(function(row, row_i){
//    console.log('Binding data for row '+row_i);
    row.selectAll('rect')
      .data(Keys.keyboard[row_i])
      .enter()
      .append('rect');

    row.selectAll('.keyname')
      .data(Keys.keyboard[row_i])
      .enter()
      .append('text')
      .attr('class','keyname');

    row.selectAll('.keylabel')
      .data(Keys.keyboard[row_i])
      .enter()
      .append('text')
      .attr('class','keylabel');
  });
  

  // Set click listeners
  var edit_submit      = document.getElementById('editSubmit');
  edit_submit.addEventListener('click', app.saveclicked);
  var edit_color       = document.getElementById('editColor');
  edit_color.addEventListener('click', app.showPalette);
  var palette_nodelist = document.getElementsByClassName('palette');
  var palette = Array.prototype.slice.call(palette_nodelist, 0);
  palette.forEach(function(el){
    el.addEventListener('click', (function(el){
      return function(){
        //console.log(JSON.stringify(el,null,2));
        var edit_color = document.getElementById('editColor');
        edit_color.value = el.innerHTML;
      };
    })(el)
    );
  });
  var save_map = document.getElementById('saveMap');
  save_map.addEventListener('click', function(e){
    //console.log(JSON.stringify(e, null, 2));
    var save_form = document.getElementById('saveForm');
    var save_state = document.getElementById('state');
    // odd error: browser stringify doesn't escape single quotes. fix:
    var tmp = JSON.stringify(Keys.keyboard);
//    var tmp = JSON.stringify(Keys.keyboard).replace(/([^\\])(')/,'$1\\$2');
//    console.log(tmp.match(/"'"/));
    save_state.value = tmp;
    save_form.submit();
  });

  // Hide modal windows
  app.hidePalette();
  app.hideEdit();

  // Update view for the first time
  app.update();
};

if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', app.init, false);
};
