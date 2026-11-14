'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const video=$('dataset-video'),canvas=$('dataset-canvas'),shell=$('dataset-player');
  if(!video||!canvas)return;
  const ctx=canvas.getContext('2d');
  const names=['Rendered appearance','Gaussian ellipsoids','Skinning ellipsoids','Skeletons'];
  let mode=0,posterReady=false;
  const poster=new Image();poster.onload=()=>{posterReady=true;draw();};poster.src='assets/dataset/turntable-atlas-poster.jpg';
  function draw(){
    const source=video.readyState>=2?video:(posterReady?poster:null);
    if(!source)return;
    const w=canvas.width,h=canvas.height;
    ctx.drawImage(source,(mode%2)*w,Math.floor(mode/2)*h,w,h,0,0,w,h);
    $('dataset-angle').textContent=`${Math.floor((video.currentTime%6)*60)}°`;
  }
  const player=createProjectPlayer(video,shell,{
    autoplay:!matchMedia('(prefers-reduced-motion: reduce)').matches,
    fps:20,draw,
    onIntent:playing=>{$('dataset-play').textContent=playing?'Pause rotation':'Play rotation';},
    onError:()=>{$('dataset-status').textContent='Press Play rotation to start.';}
  });
  document.querySelectorAll('[data-dataset-mode]').forEach(button=>button.addEventListener('click',()=>{
    mode=Number(button.dataset.datasetMode);
    document.querySelectorAll('[data-dataset-mode]').forEach(b=>{const active=Number(b.dataset.datasetMode)===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    canvas.setAttribute('aria-label',`32 unique rotating dataset objects: ${names[mode]}`);
    draw();
  }));
  $('dataset-play').addEventListener('click',()=>player.toggle());
  $('dataset-fullscreen').addEventListener('click',()=>{
    if(document.fullscreenElement){document.exitFullscreen();}
    else if(shell.requestFullscreen){shell.requestFullscreen().catch(()=>{$('dataset-status').textContent='Full screen is unavailable in this browser.';});}
  });
  video.addEventListener('loadeddata',()=>{draw();$('dataset-status').textContent='';});
  video.addEventListener('playing',()=>{$('dataset-status').textContent='';});
  video.addEventListener('seeked',draw);
  video.addEventListener('error',()=>{$('dataset-status').textContent='Video could not load. Keep the assets folder beside index.html.';});
})();
