document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // POSTER GENERATOR
    // =========================================================
    const imageUpload = document.getElementById('imageUpload');
    const eventNameInput = document.getElementById('eventName');
    const eventSubtitleInput = document.getElementById('eventSubtitle');
    const eventDateInput = document.getElementById('eventDate');
    const eventTimeInput = document.getElementById('eventTime');
    const eventVenueInput = document.getElementById('eventVenue');
    const headingFieldsGroup = document.getElementById('headingFieldsGroup');
    const headingLine1Input = document.getElementById('headingLine1');
    const headingLine2Input = document.getElementById('headingLine2');
    const fontPicker = document.getElementById('fontPicker');
    const fontPickerTrigger = document.getElementById('fontPickerTrigger');
    const fontPickerTriggerText = document.getElementById('fontPickerTriggerText');
    const fontPickerList = document.getElementById('fontPickerList');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const eventDetailsFields = document.getElementById('eventDetailsFields');
    const staticTemplateNote = document.getElementById('staticTemplateNote');
    const dropzone = document.getElementById('dropzone');
    const dropzoneContent = document.getElementById('dropzoneContent');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const thumbnail = document.getElementById('thumbnail');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const templateGrid = document.getElementById('templateGrid');
    const generateBtn = document.getElementById('generateBtn');
    const posterCanvas = document.getElementById('posterCanvas');
    const canvasPlaceholder = document.getElementById('canvasPlaceholder');
    const generatedPoster = document.getElementById('generatedPoster');
    const posterTemplateImg = document.getElementById('posterTemplateImg');
    const posterHeadingZone = document.getElementById('posterHeadingZone');
    const posterHeadingLine1 = document.getElementById('posterHeadingLine1');
    const posterHeadingLine2 = document.getElementById('posterHeadingLine2');
    const posterTextZone = document.getElementById('posterTextZone');
    const posterEventImageWrapper = document.getElementById('posterEventImageWrapper');
    const posterEventImage = document.getElementById('posterEventImage');
    const posterTitle = document.getElementById('posterTitle');
    const posterSubtitle = document.getElementById('posterSubtitle');
    const posterDate = document.getElementById('posterDate');
    const posterTime = document.getElementById('posterTime');
    const posterVenue = document.getElementById('posterVenue');
    const posterVenueItem = posterVenue.closest('.poster-detail-item');
    const downloadBtn = document.getElementById('downloadBtn');

    let uploadedImageBase64 = null;
    let selectedTemplate = null;
    const templateOptions = Array.isArray(window.availableTemplates) ? window.availableTemplates : [];

    const FONT_OPTIONS = [
        { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', -apple-system, sans-serif" },
        { label: 'Outfit', value: "'Outfit', -apple-system, sans-serif" },
        { label: 'Poppins', value: "'Poppins', -apple-system, sans-serif" },
        { label: 'Montserrat', value: "'Montserrat', -apple-system, sans-serif" },
        { label: 'Raleway', value: "'Raleway', -apple-system, sans-serif" },
        { label: 'Oswald', value: "'Oswald', -apple-system, sans-serif" },
        { label: 'Playfair Display', value: "'Playfair Display', Georgia, serif" },
        { label: 'Bebas Neue', value: "'Bebas Neue', -apple-system, sans-serif" }
    ];
    let selectedFont = FONT_OPTIONS[0];
    let fontScale = 1;

    const DEFAULT_LAYOUT = {
        text_top: '55%', text_height: '30%', text_left: '7%', text_right: '46%',
        photo_top: '12%', photo_height: '74%', photo_right: '1.5%', photo_width: '42%',
        text_color: '#1a2f4d', text_secondary: '#55627a',
        pill_bg: 'rgba(26, 47, 77, 0.08)',
        heading_top: '27%', heading_height: '20%', heading_left: '5%', heading_right: '44%'
    };
    const HEADING_SIZE_CONFIG = {
        line1: { max: 1.9, min: 1.0, step: 0.02 },
        line2: { max: 2.9, min: 1.3, step: 0.02 }
    };

    function renderFontOptions() {
        if (!fontPickerList) return;
        fontPickerList.innerHTML = '';
        FONT_OPTIONS.forEach(font => {
            const item = document.createElement('li');
            item.className = 'font-picker-option' + (font.value === selectedFont.value ? ' active' : '');
            item.setAttribute('role', 'option');
            item.tabIndex = 0;
            const name = document.createElement('span');
            name.className = 'font-picker-option-name';
            name.textContent = font.label;
            const preview = document.createElement('span');
            preview.className = 'font-picker-option-preview';
            preview.style.fontFamily = font.value;
            preview.textContent = 'AaBb — Poster Text 123';
            item.append(name, preview);
            item.addEventListener('click', () => selectFont(font));
            item.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectFont(font); }
            });
            fontPickerList.appendChild(item);
        });
    }

    function selectFont(font) {
        selectedFont = font;
        fontPickerTriggerText.textContent = font.label;
        fontPickerTriggerText.style.fontFamily = font.value;
        closeFontPicker();
        renderFontOptions();
        applyFontStyleVariables();
        updatePosterPreview();
    }

    function openFontPicker() {
        fontPickerList.style.display = 'block';
        fontPickerTrigger.classList.add('active');
        fontPickerTrigger.setAttribute('aria-expanded', 'true');
    }
    function closeFontPicker() {
        fontPickerList.style.display = 'none';
        fontPickerTrigger.classList.remove('active');
        fontPickerTrigger.setAttribute('aria-expanded', 'false');
    }
    if (fontPickerTrigger) fontPickerTrigger.addEventListener('click', () => {
        fontPickerList.style.display === 'none' ? openFontPicker() : closeFontPicker();
    });
    document.addEventListener('click', e => {
        if (fontPicker && !fontPicker.contains(e.target)) closeFontPicker();
    });

    function applyFontStyleVariables() {
        generatedPoster.style.setProperty('--poster-font-family', selectedFont.value);
        generatedPoster.style.setProperty('--poster-font-scale', fontScale);
    }
    fontSizeSlider?.addEventListener('input', () => {
        fontScale = Number(fontSizeSlider.value) / 100;
        fontSizeValue.textContent = fontSizeSlider.value + '%';
        applyFontStyleVariables();
        updatePosterPreview();
    });

    function renderTemplateCards() {
        templateGrid.innerHTML = '';
        if (!templateOptions.length) {
            const msg = document.createElement('div');
            msg.className = 'template-empty-state';
            msg.textContent = 'No poster templates found. Add PNG or JPG files to the templates folder.';
            templateGrid.appendChild(msg);
            return;
        }
        templateOptions.forEach(template => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'template-card' + (selectedTemplate?.url === template.url ? ' selected' : '');
            card.innerHTML = `<img src="${template.url}" alt="${template.name} preview">
                <div class="template-card-name">${template.name}</div>
                <span class="template-check"><i class="fa-solid fa-circle-check"></i></span>`;
            card.addEventListener('click', () => {
                selectedTemplate = template;
                renderTemplateCards();
                updateHeadingFieldVisibility();
                updateStaticTemplateVisibility();
                updatePosterPreview();
            });
            templateGrid.appendChild(card);
        });
    }

    function formatDisplayDate(value) {
        if (!value) return 'October 15, 2026';
        return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    function formatDisplayTime(value) {
        if (!value) return '7:00 PM';
        return new Date(`1970-01-01T${value}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    function applyTemplateLayout(template) {
        const m = Object.assign({}, DEFAULT_LAYOUT, template?.layout || {});
        Object.entries({
            '--text-top': m.text_top, '--text-height': m.text_height, '--text-left': m.text_left,
            '--text-right': m.text_right, '--photo-top': m.photo_top, '--photo-height': m.photo_height,
            '--photo-right': m.photo_right, '--photo-width': m.photo_width, '--zone-text': m.text_color,
            '--zone-text-secondary': m.text_secondary, '--zone-pill-bg': m.pill_bg,
            '--heading-top': m.heading_top, '--heading-height': m.heading_height,
            '--heading-left': m.heading_left, '--heading-right': m.heading_right
        }).forEach(([key, value]) => generatedPoster.style.setProperty(key, value));
    }

    function fitHeadingLineToWidth(el, config) {
        if (!el) return;
        const max = config.max * fontScale, min = config.min * fontScale, step = config.step * fontScale;
        el.style.fontSize = max + 'rem';
        if (!el.textContent.trim()) return;
        const container = el.closest('.poster-heading-zone');
        if (!container || !container.clientWidth) return;
        let size = max;
        while (el.scrollWidth > container.clientWidth && size > min) {
            size = Math.max(min, +(size - step).toFixed(3));
            el.style.fontSize = size + 'rem';
        }
    }
    function resizeHeadingText() {
        if (posterHeadingZone.style.display === 'none') return;
        fitHeadingLineToWidth(posterHeadingLine1, HEADING_SIZE_CONFIG.line1);
        fitHeadingLineToWidth(posterHeadingLine2, HEADING_SIZE_CONFIG.line2);
    }
    posterTemplateImg.addEventListener('load', () => {
        if (posterTemplateImg.naturalWidth && posterTemplateImg.naturalHeight)
            posterCanvas.style.setProperty('--canvas-ratio', `${posterTemplateImg.naturalWidth} / ${posterTemplateImg.naturalHeight}`);
        resizeHeadingText();
    });
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeHeadingText, 120);
    });

    function updateStaticTemplateVisibility() {
        const isStatic = !!selectedTemplate?.static;
        eventDetailsFields.style.display = isStatic ? 'none' : 'block';
        staticTemplateNote.style.display = isStatic ? 'block' : 'none';
    }
    function updateHeadingFieldVisibility() {
        const supports = !!selectedTemplate?.custom_heading;
        headingFieldsGroup.style.display = supports ? 'block' : 'none';
        if (!supports) { headingLine1Input.value = ''; headingLine2Input.value = ''; }
    }

    function updatePosterPreview() {
        const isStatic = !!selectedTemplate?.static;
        posterTitle.textContent = eventNameInput.value.trim() || 'Event Title Placeholder';
        posterSubtitle.textContent = eventSubtitleInput.value.trim();
        posterDate.textContent = formatDisplayDate(eventDateInput.value);
        posterTime.textContent = formatDisplayTime(eventTimeInput.value);
        posterVenue.textContent = eventVenueInput.value.trim();
        posterVenueItem.style.display = eventVenueInput.value.trim() ? 'flex' : 'none';

        const supportsHeading = !!selectedTemplate?.custom_heading;
        posterHeadingLine1.textContent = supportsHeading ? headingLine1Input.value.trim() : '';
        posterHeadingLine2.textContent = supportsHeading ? headingLine2Input.value.trim() : '';
        posterHeadingZone.style.display = !isStatic && (posterHeadingLine1.textContent || posterHeadingLine2.textContent) ? 'block' : 'none';

        if (selectedTemplate) {
            posterTemplateImg.src = selectedTemplate.url;
            applyTemplateLayout(selectedTemplate);
        }
        if (!isStatic && uploadedImageBase64) {
            posterEventImage.src = uploadedImageBase64;
            posterEventImageWrapper.style.display = 'block';
        } else {
            posterEventImageWrapper.style.display = 'none';
        }
        posterTextZone.style.display = isStatic ? 'none' : 'flex';
        if (generatedPoster.style.display !== 'none') resizeHeadingText();
    }

    function showGeneratedPoster() {
        updatePosterPreview();
        canvasPlaceholder.style.display = 'none';
        generatedPoster.style.display = 'block';
        generatedPoster.classList.add('fade-in');
        downloadBtn.style.display = 'inline-flex';
        resizeHeadingText();
    }

    imageUpload.addEventListener('change', e => { if (e.target.files[0]) handleImageFile(e.target.files[0]); });
    function handleImageFile(file) {
        if (!file.type.startsWith('image/')) return alert('Please upload an image file.');
        if (file.size > 5 * 1024 * 1024) return alert('Please keep the image under 5MB.');
        const reader = new FileReader();
        reader.onload = e => {
            uploadedImageBase64 = e.target.result;
            thumbnail.src = uploadedImageBase64;
            dropzoneContent.style.display = 'none';
            thumbnailContainer.style.display = 'flex';
            if (eventNameInput.value.trim() && eventDateInput.value && selectedTemplate) showGeneratedPoster();
            else updatePosterPreview();
        };
        reader.readAsDataURL(file);
    }
    removeImageBtn.addEventListener('click', e => {
        e.stopPropagation(); imageUpload.value = ''; uploadedImageBase64 = null;
        thumbnail.src = ''; thumbnailContainer.style.display = 'none'; dropzoneContent.style.display = 'flex';
        updatePosterPreview();
    });
    ['dragenter','dragover'].forEach(n => dropzone.addEventListener(n, e => { e.preventDefault(); dropzone.classList.add('drag-active'); }));
    ['dragleave','drop'].forEach(n => dropzone.addEventListener(n, e => { e.preventDefault(); dropzone.classList.remove('drag-active'); }));
    dropzone.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); });
    [eventNameInput,eventSubtitleInput,eventDateInput,eventTimeInput,eventVenueInput,headingLine1Input,headingLine2Input].forEach(el => el.addEventListener('input', updatePosterPreview));

    generateBtn.addEventListener('click', () => {
        if (!selectedTemplate) return alert('Please select a template before generating the poster.');
        if (!selectedTemplate.static) {
            if (!eventNameInput.value.trim()) return alert('Please fill out the Event Name.');
            if (!eventDateInput.value) return alert('Please select a Date.');
        }
        showGeneratedPoster();
    });

    downloadBtn.addEventListener('click', () => {
        downloadBtn.disabled = true;
        const old = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fa-solid fa-circle-notch spinner"></i> Preparing Download...';
        generatedPoster.classList.remove('fade-in');
        generatedPoster.style.animation = 'none';
        generatedPoster.style.opacity = '1';
        html2canvas(generatedPoster, { scale: 3, useCORS: true, logging: false, backgroundColor: '#fff' })
            .then(canvas => {
                const a = document.createElement('a');
                a.href = canvas.toDataURL('image/png');
                a.download = (eventNameInput.value.trim() || 'Poster') + '.png';
                a.click();
            })
            .catch(() => alert('Could not generate the poster download.'))
            .finally(() => { downloadBtn.disabled = false; downloadBtn.innerHTML = old; });
    });

    // =========================================================
    // VIDEO SLIDESHOW
    // 30-image maximum. One selected image = one slide.
    // Music is routed through Web Audio so it is actually included
    // in the recorded WebM, not merely heard during preview.
    // =========================================================
    const MAX_SLIDES = 30;
    const SLIDE_SECONDS = 2;
    const DEFAULT_VIDEO_SECONDS = 60;
    const QUIET_MUSIC_LEVEL = 0.18;

    const videoAddImagesBtn = document.getElementById('videoAddImagesBtn');
    const videoAddMusicBtn = document.getElementById('videoAddMusicBtn');
    const videoImagePicker = document.getElementById('videoImagePicker');
    const videoMusicPicker = document.getElementById('videoMusicPicker');
    const videoAddBox = document.getElementById('videoAddBox');
    const closeImagePicker = document.getElementById('closeImagePicker');
    const closeMusicPicker = document.getElementById('closeMusicPicker');
    const doneImagesBtn = document.getElementById('doneImagesBtn');
    const browseLocalImagesBtn = document.getElementById('browseLocalImagesBtn');
    const localImagesInput = document.getElementById('localImagesInput');
    const browseLocalMusicBtn = document.getElementById('browseLocalMusicBtn');
    const localMusicInput = document.getElementById('localMusicInput');
    const videoImageSearchInput = document.getElementById('videoImageSearchInput');
    const videoMusicSearchInput = document.getElementById('videoMusicSearchInput');
    const videoImageResults = document.getElementById('videoImageResults');
    const videoMusicResults = document.getElementById('videoMusicResults');
    const videoSelectedStrip = document.getElementById('videoSelectedStrip');
    const imageCountText = document.getElementById('imageCountText');
    const selectedVideoMedia = document.getElementById('selectedVideoMedia');
    const selectedMediaCount = document.getElementById('selectedMediaCount');
    const videoThumbnailStrip = document.getElementById('videoThumbnailStrip');
    const selectedMusicLine = document.getElementById('selectedMusicLine');
    const slideshowCanvas = document.getElementById('slideshowCanvas');
    const videoEmptyOverlay = document.getElementById('videoEmptyOverlay');
    const slideshowPlayBtn = document.getElementById('slideshowPlayBtn');
    const slideshowControls = document.getElementById('slideshowControls');
    const slideshowBackBtn = document.getElementById('slideshowBackBtn');
    const slideshowPauseBtn = document.getElementById('slideshowPauseBtn');
    const slideshowNextBtn = document.getElementById('slideshowNextBtn');
    const slideProgressFill = document.getElementById('slideProgressFill');
    const slideNumber = document.getElementById('slideNumber');
    const videoPreviewStatus = document.getElementById('videoPreviewStatus');
    const downloadVideoBtn = document.getElementById('downloadVideoBtn');

    let selectedImages = [];
    let lastVideoImageResults = [];
    let selectedMusic = null;
    let previewFinished = false;
    let imageTimer = null;
    let musicTimer = null;
    let currentSlide = 0;
    let previewRunning = false;
    let previewTimer = null;
    let audioContext = null;
    let audioElement = null;
    let musicSource = null;
    let musicGain = null;
    let recording = false;

    function proxyUrl(url) {
        return '/api/media/proxy?url=' + encodeURIComponent(url);
    }

    function mediaPlaybackUrl(url) {
        if (!url) return '';
        return String(url).startsWith('blob:') ? url : proxyUrl(url);
    }

    function renderVideoSelectedStrip() {
        videoSelectedStrip.innerHTML = '';
        selectedImages.forEach((img, index) => {
            const chip = document.createElement('div');
            chip.className = 'video-selected-chip';
            chip.innerHTML = `<img src="${img.preview}" alt=""><span>${index + 1}</span><button type="button" title="Remove"><i class="fa-solid fa-xmark"></i></button>`;
            chip.querySelector('button').addEventListener('click', () => {
                selectedImages = selectedImages.filter(x => x.id !== img.id);
                if (img.local && img.preview) URL.revokeObjectURL(img.preview);
                renderVideoSelectedStrip();
                renderVideoImageResults(lastVideoImageResults);
                refreshVideoStudio();
                preloadPreviewImages();
            });
            videoSelectedStrip.appendChild(chip);
        });
        imageCountText.textContent = `${selectedImages.length} / ${MAX_SLIDES} selected`;
    }

    function renderVideoImageResults(images) {
        lastVideoImageResults = images || [];
        videoImageResults.innerHTML = '';
        if (!images?.length) {
            videoImageResults.innerHTML = '<p class="music-results-status">No images found. Try another search.</p>';
            return;
        }
        images.forEach(img => {
            const item = document.createElement('div');
            const chosen = selectedImages.some(x => x.id === img.id);
            item.className = 'image-result-item' + (chosen ? ' selected' : '');
            item.innerHTML = `<img src="${img.preview}" alt="${img.tags || ''}" loading="lazy"><span class="image-result-check"><i class="fa-solid fa-check"></i></span>`;
            item.addEventListener('click', () => {
                if (chosen) selectedImages = selectedImages.filter(x => x.id !== img.id);
                else if (selectedImages.length < MAX_SLIDES) selectedImages.push(img);
                else return alert(`You can add up to ${MAX_SLIDES} images.`);
                renderVideoSelectedStrip();
                renderVideoImageResults(lastVideoImageResults);
                refreshVideoStudio();
            });
            videoImageResults.appendChild(item);
        });
    }

    async function searchVideoImages(q) {
        videoImageResults.innerHTML = '<p class="music-results-status">Searching…</p>';
        try {
            const r = await fetch('/api/images/search?q=' + encodeURIComponent(q || ''));
            const d = await r.json();
            if (!r.ok || d.error) throw new Error(d.error || 'Search failed');
            renderVideoImageResults(d.images || []);
        } catch (e) {
            videoImageResults.innerHTML = `<p class="music-results-status">Couldn't load images: ${e.message}</p>`;
        }
    }

    function renderVideoMusicResults(tracks) {
        videoMusicResults.innerHTML = '';
        if (!tracks?.length) {
            videoMusicResults.innerHTML = '<p class="music-results-status">No tracks found. Try calm, ambient, piano, soft, or instrumental.</p>';
            return;
        }
        tracks.forEach(track => {
            const item = document.createElement('div');
            const chosen = selectedMusic?.id === track.id;
            item.className = 'music-result-item' + (chosen ? ' selected' : '');
            item.innerHTML = `<img class="music-result-cover" src="${track.image || ''}" alt="">
                <div class="music-result-info">
                    <div class="music-result-name">${escapeHtml(track.name || 'Untitled')}</div>
                    <div class="music-result-artist">${escapeHtml(track.artist || 'Unknown artist')} · ${formatTrackDuration(track.duration)}</div>
                    <audio class="music-result-audio" controls preload="none" src="${track.audio || ''}"></audio>
                </div>
                <button type="button" class="music-select-btn">${chosen ? '<i class="fa-solid fa-check"></i> Selected' : 'Select'}</button>`;
            item.querySelector('.music-select-btn').addEventListener('click', () => {
                selectedMusic = track;
                renderVideoMusicResults(tracks);
                refreshVideoStudio();
            });
            const audio = item.querySelector('audio');
            audio.addEventListener('play', () => videoMusicResults.querySelectorAll('audio').forEach(a => { if (a !== audio) a.pause(); }));
            videoMusicResults.appendChild(item);
        });
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    function formatTrackDuration(sec) {
        if (!Number.isFinite(Number(sec))) return '';
        const m = Math.floor(Number(sec) / 60);
        const s = Math.floor(Number(sec) % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    async function searchVideoMusic(q) {
        videoMusicResults.innerHTML = '<p class="music-results-status">Searching…</p>';
        try {
            const r = await fetch('/api/music/search?q=' + encodeURIComponent(q || ''));
            const d = await r.json();
            if (!r.ok || d.error) throw new Error(d.error || 'Search failed');
            renderVideoMusicResults(d.tracks || []);
        } catch (e) {
            videoMusicResults.innerHTML = `<p class="music-results-status">Couldn't load music: ${e.message}</p>`;
        }
    }

    function addLocalImages(files) {
        const imageFiles = Array.from(files || []).filter(file => file.type.startsWith('image/'));
        if (!imageFiles.length) return;
        const available = MAX_SLIDES - selectedImages.length;
        if (available <= 0) {
            alert(`You can add up to ${MAX_SLIDES} images.`);
            return;
        }
        imageFiles.slice(0, available).forEach((file, index) => {
            const url = URL.createObjectURL(file);
            selectedImages.push({
                id: `local-${Date.now()}-${index}-${Math.random()}`,
                preview: url,
                webformat: url,
                large: url,
                tags: file.name,
                user: 'Local file',
                local: true
            });
        });
        renderVideoSelectedStrip();
        refreshVideoStudio();
        localImagesInput.value = '';
        if (imageFiles.length > available) alert(`Only ${available} image${available === 1 ? '' : 's'} were added because the maximum is ${MAX_SLIDES}.`);
    }

    function addLocalMusic(file) {
        if (!file || !file.type.startsWith('audio/')) return;
        if (selectedMusic?.local && selectedMusic.audio) URL.revokeObjectURL(selectedMusic.audio);
        const url = URL.createObjectURL(file);
        selectedMusic = {
            id: `local-music-${Date.now()}`,
            name: file.name,
            artist: 'Local file',
            duration: 0,
            image: '',
            audio: url,
            local: true
        };
        refreshVideoStudio();
        localMusicInput.value = '';
    }

    browseLocalImagesBtn?.addEventListener('click', () => localImagesInput?.click());
    localImagesInput?.addEventListener('change', e => addLocalImages(e.target.files));
    browseLocalMusicBtn?.addEventListener('click', () => localMusicInput?.click());
    localMusicInput?.addEventListener('change', e => addLocalMusic(e.target.files?.[0]));

    function openImagePicker() {
        videoMusicPicker.style.display = 'none';
        videoImagePicker.style.display = 'block';
        if (!lastVideoImageResults.length) searchVideoImages('');
    }
    function openMusicPicker() {
        videoImagePicker.style.display = 'none';
        videoMusicPicker.style.display = 'block';
        if (!videoMusicResults.children.length) searchVideoMusic('');
    }
    videoAddImagesBtn?.addEventListener('click', openImagePicker);
    videoAddBox?.addEventListener('click', openImagePicker);
    closeImagePicker?.addEventListener('click', () => videoImagePicker.style.display = 'none');
    closeMusicPicker?.addEventListener('click', () => videoMusicPicker.style.display = 'none');
    doneImagesBtn?.addEventListener('click', () => videoImagePicker.style.display = 'none');
    videoAddMusicBtn?.addEventListener('click', openMusicPicker);

    videoImageSearchInput?.addEventListener('input', () => {
        clearTimeout(imageTimer);
        imageTimer = setTimeout(() => searchVideoImages(videoImageSearchInput.value.trim()), 450);
    });
    videoMusicSearchInput?.addEventListener('input', () => {
        clearTimeout(musicTimer);
        musicTimer = setTimeout(() => searchVideoMusic(videoMusicSearchInput.value.trim()), 450);
    });

    let previewStartLock = false;
    let previewAnimationFrame = null;
    let previewSlideStartedAt = 0;

    function refreshVideoStudio() {
        videoAddImagesBtn.querySelector('small').textContent = `${selectedImages.length} / ${MAX_SLIDES}`;
        selectedVideoMedia.style.display = selectedImages.length || selectedMusic ? 'block' : 'none';
        selectedMediaCount.textContent = `${selectedImages.length} image${selectedImages.length === 1 ? '' : 's'}`;
        if (selectedImages.length) {
            const durationPerSlide = selectedImages.length > 0 ? DEFAULT_VIDEO_SECONDS / selectedImages.length : 0;
            videoPreviewStatus.textContent = selectedImages.length ? (previewFinished ? 'Preview finished' : `${selectedImages.length} slides · ${durationPerSlide.toFixed(1)}s each`) : 'Add images to preview';
        }
        videoThumbnailStrip.innerHTML = '';
        selectedImages.forEach((img, i) => {
            const wrap = document.createElement('div');
            wrap.className = 'video-thumb';
            wrap.innerHTML = `<img src="${img.preview}" alt=""><span>${i + 1}</span>`;
            videoThumbnailStrip.appendChild(wrap);
        });
        if (selectedMusic) {
            selectedMusicLine.style.display = 'flex';
            selectedMusicLine.innerHTML = `<i class="fa-solid fa-music"></i><span><b>${escapeHtml(selectedMusic.name)}</b> · ${escapeHtml(selectedMusic.artist || '')}</span><button type="button" id="removeVideoMusic" title="Remove"><i class="fa-solid fa-xmark"></i></button>`;
            document.getElementById('removeVideoMusic').onclick = () => { if (selectedMusic?.local && selectedMusic.audio) URL.revokeObjectURL(selectedMusic.audio); selectedMusic = null; refreshVideoStudio(); };
        } else selectedMusicLine.style.display = 'none';

        videoAddBox.classList.toggle('has-images', selectedImages.length > 0);
        videoEmptyOverlay.style.display = selectedImages.length ? 'none' : 'flex';
        slideshowPlayBtn.style.display = selectedImages.length && !previewRunning ? 'flex' : 'none';
        slideshowControls.style.display = selectedImages.length ? 'flex' : 'none';
        downloadVideoBtn.disabled = selectedImages.length === 0 || recording;
        const durationPerSlide = selectedImages.length ? DEFAULT_VIDEO_SECONDS / selectedImages.length : 0;
        videoPreviewStatus.textContent = selectedImages.length ? (previewFinished ? 'Preview finished' : `${selectedImages.length} slides · ${durationPerSlide.toFixed(1)}s each`) : 'Add images to preview';
        drawSlide(currentSlide, 'preview');
    }

    function drawContainImage(ctx, img, w, h) {
        // "Contain" fit: scales the image down to fit entirely within the frame
        // (whether portrait or landscape) instead of cropping it to fill the
        // frame. Leftover space is letterboxed/pillarboxed with the canvas's
        // existing background fill.
        const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
        if (!iw || !ih) return;
        const scale = Math.min(w / iw, h / ih);
        const dw = iw * scale, dh = ih * scale;
        const dx = (w - dw) / 2, dy = (h - dh) / 2;
        ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
    }

    async function loadSlideImage(item, quality = 'preview') {
        const cacheKey = quality === 'record' ? '_recordImage' : '_previewImage';
        if (item[cacheKey]) return item[cacheKey];

        const source = quality === 'record'
            ? (item.large || item.webformat || item.preview)
            : (item.webformat || item.preview || item.large);

        const img = new Image();
        img.decoding = 'async';
        img.src = item.local ? source : proxyUrl(source);
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        item[cacheKey] = img;
        return img;
    }

    async function preloadPreviewImages() {
        await Promise.allSettled(selectedImages.map(item => loadSlideImage(item, 'preview')));
    }

    async function drawSlide(index, quality = 'preview') {
        if (!selectedImages.length) return;
        currentSlide = Math.max(0, Math.min(index, selectedImages.length - 1));
        const ctx = slideshowCanvas.getContext('2d');
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, slideshowCanvas.width, slideshowCanvas.height);
        try {
            const img = await loadSlideImage(selectedImages[currentSlide], quality);
            drawContainImage(ctx, img, slideshowCanvas.width, slideshowCanvas.height);
        } catch {
            ctx.fillStyle = '#1c253c';
            ctx.fillRect(0, 0, slideshowCanvas.width, slideshowCanvas.height);
            ctx.fillStyle = '#f8fafc';
            ctx.font = '32px Plus Jakarta Sans';
            ctx.textAlign = 'center';
            ctx.fillText('Could not load this image', slideshowCanvas.width / 2, slideshowCanvas.height / 2);
        }
        slideNumber.textContent = `${currentSlide + 1} / ${selectedImages.length}`;
        slideProgressFill.style.width = `${((currentSlide + 1) / selectedImages.length) * 100}%`;
    }

    function stopPreview() {
        previewRunning = false;
        previewStartLock = false;
        clearTimeout(previewTimer);
        if (previewAnimationFrame) cancelAnimationFrame(previewAnimationFrame);
        previewAnimationFrame = null;
        slideshowPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        slideshowPlayBtn.style.display = selectedImages.length ? 'flex' : 'none';
        stopMusicPlayback();
        if (selectedImages.length) {
            slideProgressFill.style.width = `${((currentSlide + 1) / selectedImages.length) * 100}%`;
        }
    }

    async function startPreview() {
        if (!selectedImages.length || previewRunning || previewStartLock) return;
        previewStartLock = true;
        try {
            if (previewFinished) {
                currentSlide = 0;
                previewFinished = false;
                slideProgressFill.style.width = '0%';
            }
            if (!selectedImages.length) return;
            await loadSlideImage(selectedImages[currentSlide], 'preview');
            preloadPreviewImages();
            if (!selectedImages.length) return;
            previewRunning = true;
            previewStartLock = false;
            slideshowPlayBtn.style.display = 'none';
            slideshowPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            if (selectedMusic) await startMusicPlayback(true);

            const loopId = ++previewAnimationFrame;
            const runCurrentSlide = async () => {
                if (!previewRunning || loopId !== previewAnimationFrame) return;
                await drawSlide(currentSlide, 'preview');
                previewSlideStartedAt = performance.now();
                const durationMs = SLIDE_SECONDS * 1000;

                while (previewRunning && performance.now() - previewSlideStartedAt < durationMs) {
                    const elapsed = performance.now() - previewSlideStartedAt;
                    const fraction = Math.min(1, elapsed / durationMs);
                    const slideFraction = (currentSlide + fraction) / selectedImages.length;
                    slideProgressFill.style.width = `${Math.min(100, slideFraction * 100)}%`;
                    await sleep(40);
                }

                if (!previewRunning) return;
                if (currentSlide >= selectedImages.length - 1) {
                    previewFinished = true;
                    stopPreview();
                    videoPreviewStatus.textContent = 'Preview finished';
                    return;
                }

                currentSlide++;
                runCurrentSlide();
            };

            runCurrentSlide();
        } catch (err) {
            console.error('Could not start slideshow preview:', err);
            stopPreview();
        }
    }

    slideshowPlayBtn.addEventListener('click', () => previewRunning ? stopPreview() : startPreview());
    slideshowPauseBtn.addEventListener('click', () => previewRunning ? stopPreview() : startPreview());
    slideshowBackBtn.addEventListener('click', () => { stopPreview(); currentSlide = (currentSlide - 1 + selectedImages.length) % selectedImages.length; drawSlide(currentSlide, 'preview'); });
    slideshowNextBtn.addEventListener('click', () => { stopPreview(); currentSlide = (currentSlide + 1) % selectedImages.length; drawSlide(currentSlide, 'preview'); });

    async function startMusicPlayback(loop) {
        if (!selectedMusic?.audio) return;
        await ensureAudioGraph();
        audioElement.src = mediaPlaybackUrl(selectedMusic.audio);
        audioElement.loop = loop;
        audioElement.currentTime = 0;
        await audioElement.play();
    }
    function stopMusicPlayback() {
        if (audioElement) {
            audioElement.pause();
            try { audioElement.currentTime = 0; } catch {}
        }
    }
    async function ensureAudioGraph() {
        if (audioContext) {
            if (audioContext.state === 'suspended') await audioContext.resume();
            return;
        }
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioElement = new Audio();
        audioElement.preload = 'auto';
        audioElement.volume = 1;
        musicSource = audioContext.createMediaElementSource(audioElement);
        musicGain = audioContext.createGain();
        musicGain.gain.value = QUIET_MUSIC_LEVEL;
        musicSource.connect(musicGain);
        musicGain.connect(audioContext.destination);
        audioElement.addEventListener('error', () => console.warn('Background music could not be loaded.'));
        await audioContext.resume();
    }

    async function waitForImages() {
        await Promise.all(selectedImages.map(item => loadSlideImage(item, 'record')));
    }

    async function holdSlideForDuration(index, durationMs, quality = 'record') {
        const endTime = performance.now() + durationMs;
        let lastRedrawAt = 0;

        while (recording && performance.now() < endTime) {
            const now = performance.now();
            if (now - lastRedrawAt >= 500) {
                currentSlide = index;
                await drawSlide(index, quality);
                lastRedrawAt = now;
            }
            await sleep(100);
        }

        if (recording) {
            currentSlide = index;
            await drawSlide(index, quality);
        }
    }

    async function recordVideo() {
        if (recording || !selectedImages.length) return;
        recording = true;
        stopPreview();
        downloadVideoBtn.disabled = true;
        const old = downloadVideoBtn.innerHTML;
        downloadVideoBtn.innerHTML = '<i class="fa-solid fa-circle-notch spinner"></i> Creating Video...';

        try {
            await waitForImages();
            const stream = slideshowCanvas.captureStream(30);
            let audioStream = null;

            // Draw the first frame before the recorder starts. Previously the
            // recorder began capturing before any slide was drawn, so its very
            // first frames could be a leftover blank/black canvas frame instead
            // of real content — a broken opening keyframe that can make some
            // players play a moment, flash black, jump to the start, and stop.
            currentSlide = 0;
            await drawSlide(0, 'record');

            if (selectedMusic?.audio) {
                await ensureAudioGraph();
                audioElement.src = mediaPlaybackUrl(selectedMusic.audio);
                audioElement.loop = true;
                audioElement.currentTime = 0;
                await audioElement.play();
                const destination = audioContext.createMediaStreamDestination();
                musicGain.connect(destination);
                audioStream = destination.stream;
                audioStream.getAudioTracks().forEach(t => stream.addTrack(t));
            }

            // Prefer MP4/H.264 output: it's what native players like Windows'
            // Media Player are built around, and it avoids WebM/VP9 muxing
            // problems some players hit when a browser-recorded WebM contains
            // long runs of identical frames (as slideshows do). Only fall back
            // to WebM if the browser genuinely can't record MP4.
            const mp4Candidates = [
                'video/mp4;codecs="avc1.640028, mp4a.40.2"',
                'video/mp4;codecs="avc1.42E01E, mp4a.40.2"',
                'video/mp4'
            ];
            const webmCandidates = [
                'video/webm;codecs=vp9,opus',
                'video/webm;codecs=vp8,opus',
                'video/webm'
            ];
            const mime = mp4Candidates.find(t => MediaRecorder.isTypeSupported(t))
                || webmCandidates.find(t => MediaRecorder.isTypeSupported(t))
                || 'video/webm';
            const isWebm = mime.includes('webm');
            const fileExtension = isWebm ? 'webm' : 'mp4';

            const chunks = [];
            const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5000000 });
            recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

            const finished = new Promise(resolve => recorder.onstop = resolve);
            const recordingStartedAt = performance.now();
            recorder.start(100);

            // The encoder hates long static canvas stretches. Keep redrawing the
            // same frame at a steady cadence while each slide is held so the output
            // remains valid and the final video doesn't develop the gray double-exposure
            // artifact seen when a canvas sits untouched for several seconds.
            const slideDurationMs = SLIDE_SECONDS * 1000;
            await holdSlideForDuration(0, slideDurationMs, 'record');
            for (let i = 1; i < selectedImages.length; i++) {
                currentSlide = i;
                await holdSlideForDuration(i, slideDurationMs, 'record');
            }

            // Hold the final slide briefly so the last encoded frames are the
            // actual final image instead of a reset/black canvas frame.
            currentSlide = selectedImages.length - 1;
            await holdSlideForDuration(currentSlide, 750, 'record');
            if (typeof recorder.requestData === 'function') recorder.requestData();
            recorder.stop();
            await finished;
            const recordedDurationMs = performance.now() - recordingStartedAt;
            stopMusicPlayback();
            stream.getTracks().forEach(track => track.stop());

            const rawBlob = new Blob(chunks, { type: mime });
            // Chrome/Chromium MediaRecorder WebM files can be missing duration
            // metadata. That makes the downloaded file look like a live stream:
            // the timeline can stay grey/frozen and seeking only works after the
            // whole video has played. Add the real duration before downloading.
            // Use the actual measured wall-clock recording time rather than a
            // fixed slide-count estimate. If the written duration is shorter or
            // longer than what was really recorded, some players will play a
            // moment, flash black, jump back to the start, and stop — matching
            // the metadata to the real recording length prevents that.
            const measuredDuration = Math.max(1, Math.round(recordedDurationMs));
            const blob = (isWebm && typeof ysFixWebmDuration === 'function')
                ? await ysFixWebmDuration(rawBlob, measuredDuration, { logger: false })
                : rawBlob;

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (eventNameInput.value.trim() || 'Slideshow') + '.' + fileExtension;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 30000);
        } catch (err) {
            console.error(err);
            alert('Could not create the video. Please try again. Make sure the selected images and music can be loaded.');
        } finally {
            recording = false;
            downloadVideoBtn.disabled = selectedImages.length === 0;
            downloadVideoBtn.innerHTML = old;
            refreshVideoStudio();
        }
    }

    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    downloadVideoBtn.addEventListener('click', recordVideo);

    renderTemplateCards();
    renderFontOptions();
    applyFontStyleVariables();
    updateHeadingFieldVisibility();
    updateStaticTemplateVisibility();
    updatePosterPreview();
    refreshVideoStudio();
});
