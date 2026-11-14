'use strict';
(() => {
  const data = window.PROJECT_DATA;
  const $ = id => document.getElementById(id);
  if (!data) { $('player-status').textContent = 'Project data could not be loaded. Keep data.js beside index.html.'; return; }
  const labels = {ground_truth:'Ground truth',riganything:'RigAnything',unirig:'UniRig',puppeteer:'Puppeteer',skintokens:'SkinTokens',ours:'Ours',ours_star:'Ours*'};
  const video = $('comparison-video');
  const contexts = [$('left-canvas').getContext('2d'),$('right-canvas').getContext('2d')];
  const selectors = [$('left-method'),$('right-method')];
  let current = data.cases[0];
  let switching = false;
  let loadingToken = 0;
  let activePoster = null;
  let scrubTimer = null;

  for (const select of selectors) {
    for (const [value,label] of Object.entries(labels)) {
      const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);
    }
  }
  selectors[0].value='skintokens';selectors[1].value='ours_star';
  const fmt = (m) => `${m.psnr.toFixed(2)} / ${m.ssim.toFixed(4)} / ${m.lpips.toFixed(4)}`;
  function captions() {
    for (let i=0;i<2;i++) {
      const m=selectors[i].value;
      const caption=$(i?'right-caption':'left-caption');caption.replaceChildren();
      const b=document.createElement('b');b.textContent=labels[m];caption.append(b);
      caption.append(document.createElement('br'));
      caption.append(m==='ground_truth'?'Reference image':`Sequence mean · ${fmt(current.metrics[m])}`);
    }
  }
  function draw(source) {
    if ($('comparison-shell').dataset.mode === 'all') return;
    const drawable=source || (video.readyState>=2 ? video : activePoster);
    if (!drawable) return;
    for (let i=0;i<2;i++) {
      const slot=current.method_slots[selectors[i].value];
      const ctx=contexts[i];ctx.fillStyle='white';ctx.fillRect(0,0,460,480);
      ctx.drawImage(drawable,(slot%4)*480+10,Math.floor(slot/4)*540+50,460,480,0,0,460,480);
    }
  }
  function updateProgress() {
    if (!current || switching) return;
    const frame=Math.min(current.frames-1,Math.max(0,Math.floor(video.currentTime*current.fps+0.001)));
    $('timeline').value=frame;
    $('frame-label').textContent=`Frame ${frame} / ${current.frames-1}`;
    $('play-toggle').textContent=player.wantsPlay?'Pause':'Play';
    $('play-toggle').setAttribute('aria-label',player.wantsPlay?'Pause comparison':'Play comparison');
  }
  const player = createProjectPlayer(video, $('comparison-shell'), {
    autoplay: false, fps: () => current.fps,
    draw: () => { if (!switching) { draw(); updateProgress(); } },
    onError: () => { $('player-status').textContent='Playback did not start. Try Play again.'; updateProgress(); }
  });
  function seek(frame) {
    if (switching || video.readyState<1) return;
    player.setPlaying(false);video.currentTime=Math.min(current.frames-1,Math.max(0,frame))/current.fps;
    updateProgress();
  }
  function chooseCase(slug) {
    const chosen=data.cases.find(c=>c.slug===slug);if(!chosen)return;
    player.setReady(false);current=chosen;switching=true;const token=++loadingToken;
    activePoster=null;
    contexts.forEach(ctx=>{ctx.fillStyle='white';ctx.fillRect(0,0,460,480);});
    $('case-title').textContent=current.title;$('case-category').textContent=current.category;
    $('timeline').max=current.frames-1;$('timeline').value=0;
    $('frame-label').textContent=`Frame 0 / ${current.frames-1}`;
    $('play-toggle').textContent='Play';
    $('sequence-info').textContent=`${current.frames} aligned frames · display ${current.fps} fps · PSNR / SSIM / LPIPS`;
    $('scene-info').textContent=`Scene ID: ${current.scene}. Complete sequence: frames 0–${current.frames-1}.`;
    $('video-download').href=current.video;$('video-download').download=`${current.slug}-all-methods.mp4`;
    document.querySelectorAll('.case-button').forEach(b=>{const active=b.dataset.slug===slug;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    captions();
    const poster=new Image();poster.onload=()=>{if(token===loadingToken){activePoster=poster;if(video.readyState<2)draw(poster);}};poster.src=current.poster;
    video.poster=current.poster;video.src=current.video;
    video.playbackRate=Number($('speed').value);video.load();
    $('player-status').textContent='Loading sequence…';
    const ready=()=>{
      if(token!==loadingToken)return;
      switching=false;$('player-status').textContent='';draw();player.setReady(true);updateProgress();
    };
    video.addEventListener('loadeddata',ready,{once:true});
  }
  for (const c of data.cases) {
    const button=document.createElement('button');button.type='button';button.className='case-button';button.dataset.slug=c.slug;button.setAttribute('aria-label',`Show ${c.title}`);
    const img=document.createElement('img');img.src=c.thumbnail;img.alt='';img.loading='lazy';
    const title=document.createElement('span');title.textContent=c.title;button.append(img,title);button.addEventListener('click',()=>chooseCase(c.slug));$('case-list').append(button);
  }
  selectors.forEach(s=>s.addEventListener('change',()=>{captions();draw();}));
  $('play-toggle').addEventListener('click',()=>{player.toggle();updateProgress();});
  $('frame-back').addEventListener('click',()=>seek(Number($('timeline').value)-1));
  $('frame-next').addEventListener('click',()=>seek(Number($('timeline').value)+1));
  $('timeline').addEventListener('input',()=>{clearTimeout(scrubTimer);const f=Number($('timeline').value);$('frame-label').textContent=`Frame ${f} / ${current.frames-1}`;scrubTimer=setTimeout(()=>seek(f),35);});
  $('timeline').addEventListener('change',()=>{clearTimeout(scrubTimer);seek(Number($('timeline').value));});
  $('speed').addEventListener('change',()=>{video.playbackRate=Number($('speed').value);});
  for(const type of ['seeked','loadeddata','pause','play','ended'])video.addEventListener(type,()=>{if(!switching){draw();updateProgress();}});
  video.addEventListener('error',()=>{$('player-status').textContent='This video could not be loaded. Keep the assets folder beside index.html, or try the downloadable MP4.';});
  function mode(value) {
    $('comparison-shell').dataset.mode=value;
    for(const m of ['pair','all']){$('mode-'+m).classList.toggle('active',m===value);$('mode-'+m).setAttribute('aria-pressed',String(m===value));}
    draw();
  }
  $('mode-pair').addEventListener('click',()=>mode('pair'));$('mode-all').addEventListener('click',()=>mode('all'));
  $('comparison-shell').addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','BUTTON'].includes(e.target.tagName)){e.preventDefault();player.toggle();updateProgress();}});
  for(const r of data.results) {
    const tr=document.createElement('tr');if(r.method==='ours')tr.className='ours-row';if(r.method==='ours_star')tr.className='star-row';
    const name=document.createElement('td');name.textContent=r.label;
    if(r.method==='ours_star'){const tag=document.createElement('span');tag.className='method-tag';tag.textContent='Animation-aware GS';name.append(tag);}
    tr.append(name);for(const key of ['psnr','ssim','lpips']){const td=document.createElement('td');td.textContent=r[key].toFixed(key==='psnr'?2:4);tr.append(td);}$('metrics-body').append(tr);
  }
  chooseCase(current.slug);
})();
