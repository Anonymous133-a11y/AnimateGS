Open index.html directly in a browser, including via SSHFS. Keep the assets folder and JS/CSS files together. No server, build, CDN, or internet connection is required.

Title: Learning Animation-Aware 3D Gaussians with Native Rigging
Authors: Anonymous Authors

RESULTS: 600 test characters, 52,246 input-pose frames. Frame-weighted PSNR, SSIM, AlexNet LPIPS.
Ours = Input GS + predicted skinning. Ours* = v3-23000 Gen GS + predicted Input-GS skinning transferred using 4-NN IDW2.
All displayed comparison videos contain every frame of the selected sequence, synchronized in a single H.264 video atlas. A common crop covers all methods and frames. Videos are presentation assets; metrics come from full-resolution uncompressed evaluation.
To edit title or copy: index.html. To edit appearance: style.css. To edit controls: app.js. Data: data.js and assets/data.
The page and downloadable metadata omit author identities and absolute server paths. Original asset provenance is retained separately in the local build workspace.

DATASET SHOWCASE: 32 unique dataset characters in a compact 8-by-4 rotating grid. Rendered appearance, Gaussian ellipsoids, skinning ellipsoids, and skeletons share a single video atlas for exact synchronization. Each six-second loop is one rotation. These examples are separate from the 600-character evaluation benchmark.

This publication folder includes only assets used by the current page and its players, plus the linked results CSV.

WEB PLAYBACK: H.264 videos are optimized for download size, with original frame counts and presentation rates preserved. The dataset video atlas is 2560 x 1280; all four modes remain synchronized. Players wait for sufficient initial buffering before playback. Evaluation metrics are unchanged.
