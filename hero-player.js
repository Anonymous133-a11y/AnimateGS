'use strict';
(() => {
  const video=document.getElementById('hero-video');
  const canvas=document.getElementById('hero-canvas');
  if(!video||!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const labels=['Rendered appearance','Skinning weights with skeleton'];
  let mode=0,ready=false;
  const poster=new Image();poster.onload=()=>{ready=true;draw();};poster.src='assets/hero-modes-poster.jpg';
  function draw(){
    const source=video.readyState>=2?video:(ready?poster:null);if(!source)return;
    ctx.drawImage(source,0,mode*334,1280,334,0,0,1280,334);
    canvas.style.display='block';document.getElementById('hero-fallback').style.display='none';
  }
  document.querySelectorAll('[data-hero-mode]').forEach(button=>button.addEventListener('click',()=>{
    mode=Number(button.dataset.heroMode);
    document.querySelectorAll('[data-hero-mode]').forEach(b=>{const active=Number(b.dataset.heroMode)===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    canvas.setAttribute('aria-label',labels[mode]+': four synchronized animated characters');draw();
  }));
  ['loadeddata','seeked','pause'].forEach(event=>video.addEventListener(event,draw));
  const toggle=document.getElementById('hero-toggle');
  const player=createProjectPlayer(video,canvas.parentElement,{
    autoplay:!matchMedia('(prefers-reduced-motion: reduce)').matches,
    fps:24,draw,
    onIntent:playing=>{
      toggle.textContent=playing?'Pause animation':'Play animation';
      toggle.setAttribute('aria-label',playing?'Pause showcase':'Play showcase');
    }
  });
  toggle.addEventListener('click',()=>player.toggle());
})();
