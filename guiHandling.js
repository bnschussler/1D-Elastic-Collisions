
presets=[["-22 -19.1 -18 -14.3 -11.4 -9.2 -4.5 3.7 7 10 16 18 21",
          "1 1 1 1 1 1 1 -1 -1 -1 -1 -1 -1",
          "1 1 1 1 1 1 1 1 1 1 1 1 1"],
          ["-10 0 4",
           "0 0 -1",
          "Infinity 1 100000000"],
          ["-15 -10 -8.7 -7.4 -6.1 -4.8 -3.5 -2.2",
           "0 -1 -1 -1 -1 -1 -1 -1",
           "Infinity 64 32 16 8 4 2 1"]]

inputs=["ptext","vtext","mtext"];

for(let i=0;i<presets.length;i++){
  document.getElementById("Preset "+(i+1)).onclick=function(){

      for(let j=0;j<inputs.length;j++){
        document.getElementById(inputs[j]).value=presets[i][j];
      }
      t=ZERO;
      run=false;
      document.getElementById("runbutton").textContent="Run";
      document.getElementById("pausebutton").disabled=true;
      settingschanged=true;
    }
}

Array.from(document.getElementsByClassName('dropdown')).forEach(dropdown => {
  
  let options=dropdown.querySelector(".options");
  let temp=options.offsetHeight;

  dropdown.querySelector(".options").setAttribute('style', dropdown.querySelector(".toggle input").checked?('height:'+temp+"px"):"height: 0px");

  dropdown.querySelector(".toggle input").addEventListener('change', function handle(event) {
    dropdown.querySelector(".toggle").style.background=this.checked?"#505050":"#303030";
    dropdown.querySelector(".options").setAttribute('style', this.checked?('height:'+temp+"px"):"height: 0px");
  });
});

Array.from(document.getElementsByClassName('toggle')).forEach(toggle => {
  toggle.style.background=toggle.querySelector("input").checked?"#505050":"#303030";
  toggle.querySelector("input").addEventListener('change', function handle(event) {
    toggle.style.background=this.checked?"#505050":"#303030";
  });
});

/*window.addEventListener('resize', function handle(event){
  Array.from(document.querySelectorAll('.interactive')).forEach(interactive =>{
    interactive.style.maxWidth="auto";
    let min=screen.width;
    let max=0;
    let elements= Array.from(interactive.querySelectorAll(":scope > .column"));
    for(let i=0;i<elements.length;i++){
      min=Math.min(elements[i].getBoundingClientRect().left,min);
      max=Math.max(elements[i].getBoundingClientRect().right,max);
    }
    console.log(max-min);
    interactive.style.maxWidth=(max-min)+"px";
  });
});*/