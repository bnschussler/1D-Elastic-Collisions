'use strict';
const canvas = document.getElementById('sketch');
var width=canvas.width;
var height=canvas.height;
const ctx = canvas.getContext('2d');

var xmin=-24;
var xmax=24;
var pos=[];
var vel=[];
var mass=[];
//var bwrad=[];
var fpos=[];
var fvel=[];
var fmass=[];
//var fbwrad=[];
var bh=1;
var colllist=[]
var pad=[]
var rmasses=[]
var strkwdth=4;
var keyframe;
var frames=[];
var collisioncount=0;
var t;
var run=false;
var settingschanged=false;
var calculating=false;
var showtotal=false;

var framerate=20;


function gcd(a,b){ //https://stackoverflow.com/questions/17445231/js-how-to-find-the-greatest-common-divisor
  let a0=a;
  let b0=b;
  while(true){
    if(b0==0) return a0;
    a0%=b0;
    if(a0==0) return b0;
    b0%=a0;
    if(isNaN(a0)){
      alert("Something went wrong! Most likely a box managed to accumulate an infinite velocity.");
      calculating=false;
      t=ZERO;
      return 0;
    }
  }
}

function numbers(str){
  return str.replace(/^ */g, '').replace(/ *$/g, '').replace(/ *$/g, '').replace(/  +/g, ' ').split(" ")
}

class BigFrac {

  constructor(num,den){
    this.num=num;//BigInt(num);
    this.den=den;//BigInt(den);
  }

  static reduced(a){
    let g=gcd(a.num,a.den);
    
    //if(g!=0n){
    if(g!=0){
      a.num/=g;
      a.den/=g;
    }

    //if(a.den<0n){
    if(a.den<0){
      a.num=-a.num;
      a.den=-a.den;
    }

    return a;
  }

  static mul(a,b){
    return new BigFrac(a.num*b.num,a.den*b.den);
  }

  static div(a,b){
    return new BigFrac(a.num*b.den,a.den*b.num);
  }

  static add(a,b){
    return BigFrac.reduced(new BigFrac(a.num*b.den+a.den*b.num,a.den*b.den));
  }

  static sub(a,b){
    return BigFrac.reduced(new BigFrac(a.num*b.den-a.den*b.num,a.den*b.den));
  }

  float(){
    //return Number((this.num*1000n)/this.den)/1000;
    return this.num/this.den;
  }

  static toBig(fst){  //input is a string of a float
    if(fst==Infinity){
      return new BigFrac(1,0);
    }
    if(fst==-Infinity){
      return new BigFrac(-1,0);
    }
    let d=String(fst).indexOf('.')
    d=(d==-1)?0:(String(fst).length-1-d);
    return BigFrac.reduced(new BigFrac(String(fst).replace('.',''),'1'+'0'.repeat(d)));
  }

  lt(a){
    return this.num*a.den<this.den*a.num;
  }

}

const ZERO=new BigFrac('0','1');
const ONE=new BigFrac('1','1');
const TWO=new BigFrac('2','1');
var dt=new BigFrac('1',framerate);

function start(){  
  ctx.lineWidth=strkwdth;
  ctx.font = "bold 30px serif"; 
  ctx.fillStyle = "#408020"; 
  ctx.textAlign = "left"; 
  t=ZERO;
  settingschanged=true;
}

function getKeyFrames(){
  
  fpos=numbers(document.getElementById("ptext").value);
  fvel=numbers(document.getElementById("vtext").value);
  fmass=numbers(document.getElementById("mtext").value);
  //fbwrad=numbers(document.getElementById("wtext").value);

  pos=[];
  vel=[];
  mass=[];
  for(let i=0;i<fpos.length;i++){
    if(isNaN(fpos[i])||isNaN(fvel[i])||isNaN(fmass[i])){
      alert("Something went wrong; check that your inputs are valid.");
      return undefined;
    }
    pos[i]=BigFrac.toBig(fpos[i]);
    vel[i]=BigFrac.toBig(fvel[i]);
    mass[i]=BigFrac.toBig(fmass[i]);

    //fbwrad[i]/=2;
    //bwrad[i]=BigFrac.toBig(fbwrad[i]);
  }

  calculating=true;
  settingschanged=false;

  t=ZERO;
  collisioncount=0;

  frames=[];
  frames[0]=[t,collisioncount,[...pos],[...vel]]

  pad=[];
  rmasses=[]
  colllist=[];

  for(let i=0;i<(pos.length-1);i++){  //initializing
    
    pad[i]=ONE//BigFrac.add(bwrad[i],bwrad[i+1]);

    //some cases for infinite masses
    if(mass[i].den==0 && mass[i+1].den!=0){rmasses[i]=[TWO,ONE,ZERO];}
    else if(mass[i].den!=0 && mass[i+1].den==0){rmasses[i]=[ZERO,new BigFrac('-1','1'),TWO];}
    else if((mass[i].den==0 && mass[i+1].den==0)||(mass[i].num==0 && mass[i+1].num==0)){rmasses[i]=[ONE,ZERO,ONE];}
    else{
      rmasses[i]=[BigFrac.div(BigFrac.mul(TWO,mass[i]),BigFrac.add(mass[i],mass[i+1])),
                  BigFrac.div(BigFrac.sub(mass[i],mass[i+1]),BigFrac.add(mass[i],mass[i+1])),
                  BigFrac.div(BigFrac.mul(TWO,mass[i+1]),BigFrac.add(mass[i],mass[i+1]))];
    }

    if(vel[i+1].lt(vel[i])){
      let dt1=BigFrac.div(BigFrac.sub(BigFrac.sub(pos[i+1],pos[i]),pad[i]),BigFrac.sub(vel[i],vel[i+1]));
      colllist[i]=BigFrac.add(t,dt1);
    }
    else{
      colllist[i]=false;
    }
  }
}


function resolveCollision(){
  let coll=-1
    for(let i=0;i<colllist.length;i++){
      if(colllist[i] && (coll==-1 || colllist[i].lt(colllist[coll]))){
        coll=i;
      }
    } //coll now holds the index of the next collision, colllist[coll] is dt till the collision


    if(coll!=-1){
      /*Collision Logic*/

      for(let i=0;i<pos.length;i++){  //update positions
        pos[i]=BigFrac.add(pos[i],BigFrac.mul(vel[i],BigFrac.sub(colllist[coll],t)));
      }

      t=colllist[coll];  //update time

      //update velocities
      [vel[coll],vel[coll+1]]=[BigFrac.add(BigFrac.mul(rmasses[coll][1],vel[coll]),BigFrac.mul(rmasses[coll][2],vel[coll+1])),
                               BigFrac.sub(BigFrac.mul(rmasses[coll][0],vel[coll]),BigFrac.mul(rmasses[coll][1],vel[coll+1]))];
      

      //update colllist
      colllist[coll]=false;
      if(coll>0 && vel[coll].lt(vel[coll-1])){
        let dt1=BigFrac.div(BigFrac.sub(BigFrac.sub(pos[coll],pos[coll-1]),pad[coll-1]),BigFrac.sub(vel[coll-1],vel[coll]));
        colllist[coll-1]=BigFrac.add(t,dt1);
      }
      if(coll<(colllist.length-1) && vel[coll+2].lt(vel[coll+1])){
        let dt1=BigFrac.div(BigFrac.sub(BigFrac.sub(pos[coll+2],pos[coll+1]),pad[coll+1]),BigFrac.sub(vel[coll+1],vel[coll+2]));
        colllist[coll+1]=BigFrac.add(t,dt1);
      }
      collisioncount++;

      /*               */
      if((new BigFrac(frames.length,framerate)).lt(t)){
        frames.push([t,collisioncount,[...pos],[...vel]]);
      }
      else{
        frames[frames.length-1]=[t,collisioncount,[...pos],[...vel]];
      }

      return true;
    }
    else{
      calculating=false;
      t=ZERO;
      return false;
    }
}
function draw(){

  if(calculating){
    let ctime=Date.now();
    while(resolveCollision() && (Date.now()-ctime)<30){}
  }

  if(!calculating){
    document.getElementById('runbutton').textContent=(run || t!=ZERO)?'Restart':'Run';
  }

  if(run && !calculating){
    t=BigFrac.add(t,dt);
  }

  if(t!=ZERO && !calculating){
    for(keyframe=0;keyframe<(frames.length-1) && frames[keyframe+1][0].lt(t);keyframe++){}
    
    for(let i=0;i<fpos.length;i++){
      fpos[i]=BigFrac.add(frames[keyframe][2][i],BigFrac.mul(frames[keyframe][3][i],BigFrac.sub(t,frames[keyframe][0]))).float();
    }
  }
  else{
    fpos=numbers(document.getElementById("ptext").value);
  }

  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = '#0000000';

  ctx.fillStyle="#999999";
  ctx.fillRect(0,0,width,height/2+bh/2*width/(xmax-xmin)+strkwdth/2);
  ctx.strokeRect(-strkwdth/2,-strkwdth/2,width+strkwdth,height/2+bh/2*width/(xmax-xmin)+strkwdth);

  ctx.fillStyle="#ffffff";
  for(let i=0;i<fpos.length;i++){
    //ctx.fillRect(((fpos[i]-fbwrad[i]-xmin)/(xmax-xmin))*width,height/2-bh/2*width/(xmax-xmin),2*fbwrad[i]*width/(xmax-xmin),bh*width/(xmax-xmin))
    //ctx.strokeRect(((fpos[i]-fbwrad[i]-xmin)/(xmax-xmin))*width,height/2-bh/2*width/(xmax-xmin),2*fbwrad[i]*width/(xmax-xmin),bh*width/(xmax-xmin))
    ctx.fillRect(((fpos[i]-0.5-xmin)/(xmax-xmin))*width,height/2-bh/2*width/(xmax-xmin),width/(xmax-xmin),bh*width/(xmax-xmin))
    ctx.strokeRect(((fpos[i]-0.5-xmin)/(xmax-xmin))*width,height/2-bh/2*width/(xmax-xmin),width/(xmax-xmin),bh*width/(xmax-xmin))
  }

  if(keyframe==frames.length-1 && t!=ZERO){ctx.fillStyle = '#30ff30';}
  ctx.fillText("Collisions: "+((t==ZERO || calculating)?0:frames[keyframe][1])+(showtotal?((t==ZERO && settingschanged)?" / ?":(" / "+(frames.length==0?0:frames[frames.length-1][1]))):""),8,30); 
}