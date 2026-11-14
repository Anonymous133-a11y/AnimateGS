'use strict';
// Keep user playback intent separate from automatic offscreen/background pauses.
window.createProjectPlayer = function(video, surface, options) {
  let wanted = !!options.autoplay, visible = !('IntersectionObserver' in window);
  let ready = true, pending = null, lastFrame = -1, generation = 0;
  const nativeFrames = typeof video.requestVideoFrameCallback === 'function';
  const active = () => wanted && visible && !document.hidden && ready;
  function stopFrames() {
    if (pending !== null) {
      if (nativeFrames) video.cancelVideoFrameCallback(pending);
      else cancelAnimationFrame(pending);
      pending = null;
    }
  }
  function schedule() {
    if (pending !== null || video.paused || !active()) return;
    if (nativeFrames) pending = video.requestVideoFrameCallback(frame);
    else pending = requestAnimationFrame(frame);
  }
  function frame() {
    pending = null;
    if (video.paused || !active()) return;
    const fps = typeof options.fps === 'function' ? options.fps() : options.fps;
    const index = Math.floor(video.currentTime * (fps || 24) + 0.001);
    if (video.readyState >= 2 && (nativeFrames || index !== lastFrame)) {
      lastFrame = index;
      options.draw();
    }
    schedule();
  }
  function update() {
    const token = ++generation;
    if (options.onIntent) options.onIntent(wanted);
    if (!active()) { video.pause(); stopFrames(); return; }
    video.play().then(() => {
      if (token !== generation) return;
      if (!active()) { video.pause(); return; }
      schedule();
    }).catch(error => {
      if (token !== generation || error.name === 'AbortError' || !active()) return;
      wanted = false;
      if (options.onIntent) options.onIntent(false);
      if (options.onError) options.onError(error);
    });
  }
  video.addEventListener('play', schedule);
  video.addEventListener('pause', stopFrames);
  video.addEventListener('emptied', () => { lastFrame = -1; stopFrames(); });
  document.addEventListener('visibilitychange', update);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      update();
    }, {threshold: 0.01}).observe(surface);
  }
  update();
  return {
    get wantsPlay() { return wanted; },
    setPlaying(value) { wanted = !!value; update(); },
    toggle() { wanted = !wanted; update(); },
    setReady(value) { ready = !!value; update(); }
  };
};
