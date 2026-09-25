import os
import json
import urllib.parse
import urllib.request
from pathlib import Path
from flask import Flask, render_template, request, jsonify, Response

APP_ROOT = Path(__file__).resolve().parent
ENV_PATH = APP_ROOT / ".env"


def load_env_file(path=ENV_PATH):
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


load_env_file()

app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')

PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY", "")
JAMENDO_CLIENT_ID = os.getenv("JAMENDO_CLIENT_ID", "")

# A real browser-like User-Agent. Some APIs (Pixabay in particular) reject
# requests from generic/blank User-Agent strings used by default HTTP
# clients, so every outbound request below sends this explicitly.
REQUEST_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 EventStudioAI/1.0"
)

TEMPLATE_FOLDER = os.path.join(os.path.dirname(__file__), 'templates')

SHARED_LAYOUT = {
    "photo_top": "12%", "photo_height": "74%", "photo_right": "1.5%", "photo_width": "42%",
    "text_top": "55%", "text_height": "30%", "text_left": "7%", "text_right": "46%",
    "text_color": "#1a2f4d", "text_secondary": "#55627a",
    "pill_bg": "rgba(26, 47, 77, 0.08)",
    "heading_top": "27%", "heading_height": "20%", "heading_left": "5%", "heading_right": "44%"
}

TEMPLATE_LAYOUTS = {
    "Template-1.png": dict(SHARED_LAYOUT),
    "Template-2.png": dict(SHARED_LAYOUT),
    "Template-3.png": dict(SHARED_LAYOUT),
}
DEFAULT_LAYOUT = dict(SHARED_LAYOUT)
CUSTOM_HEADING_TEMPLATES = {"Template-1.png"}
STATIC_TEMPLATES = {"Template-3.png"}


def get_template_files():
    if not os.path.isdir(TEMPLATE_FOLDER):
        return []
    templates = []
    for entry in sorted(os.listdir(TEMPLATE_FOLDER)):
        if entry.lower().endswith(('.png', '.jpg', '.jpeg')):
            name = os.path.splitext(entry)[0].replace('-', ' ').replace('_', ' ').title()
            templates.append({
                'name': name,
                'url': f'/templates/{entry}',
                'filename': entry,
                'layout': TEMPLATE_LAYOUTS.get(entry, DEFAULT_LAYOUT),
                'custom_heading': entry in CUSTOM_HEADING_TEMPLATES,
                'static': entry in STATIC_TEMPLATES
            })
    return templates


def fetch_json(url):
    """Fetch a URL and parse it as JSON, always sending a real-browser
    User-Agent header so APIs like Pixabay don't reject the request."""
    req = urllib.request.Request(url, headers={'User-Agent': REQUEST_USER_AGENT})
    with urllib.request.urlopen(req, timeout=8) as response:
        return json.loads(response.read().decode('utf-8'))


@app.route('/')
def index():
    return render_template('index.html', poster_templates=get_template_files())


@app.route('/api/images/search')
def images_search():
    if not PIXABAY_API_KEY or PIXABAY_API_KEY == "YOUR_PIXABAY_API_KEY_HERE":
        return jsonify({'error': 'Pixabay API key is not set in the environment.'}), 500

    query = request.args.get('q', '').strip()
    params = {
        'key': PIXABAY_API_KEY, 'per_page': '24',
        'safesearch': 'true', 'image_type': 'photo'
    }
    if query:
        params['q'] = query
    else:
        params['order'] = 'popular'

    url = 'https://pixabay.com/api/?' + urllib.parse.urlencode(params)
    try:
        data = fetch_json(url)
    except Exception as exc:
        return jsonify({'error': f'Could not reach Pixabay: {exc}'}), 502

    images = []
    for hit in data.get('hits', []):
        images.append({
            'id': hit.get('id'),
            'preview': hit.get('previewURL'),
            'webformat': hit.get('webformatURL'),
            'large': hit.get('largeImageURL'),
            'tags': hit.get('tags'),
            'user': hit.get('user')
        })
    return jsonify({'images': images})


@app.route('/api/music/search')
def music_search():
    if not JAMENDO_CLIENT_ID or JAMENDO_CLIENT_ID == "YOUR_JAMENDO_CLIENT_ID_HERE":
        return jsonify({'error': 'Jamendo Client ID is not set in the environment.'}), 500

    query = request.args.get('q', '').strip()
    params = {
        'client_id': JAMENDO_CLIENT_ID,
        'format': 'json',
        'limit': '20',
        'vocalinstrumental': 'instrumental',
        'audioformat': 'mp32',
        'imagesize': '100'
    }
    if query:
        params['search'] = query
    else:
        params['order'] = 'popularity_total'
        params['groupby'] = 'artist_id'

    url = 'https://api.jamendo.com/v3.0/tracks/?' + urllib.parse.urlencode(params)
    try:
        data = fetch_json(url)
    except Exception as exc:
        return jsonify({'error': f'Could not reach Jamendo: {exc}'}), 502

    tracks = []
    for t in data.get('results', []):
        tracks.append({
            'id': t.get('id'),
            'name': t.get('name'),
            'artist': t.get('artist_name'),
            'duration': t.get('duration'),
            'image': t.get('image'),
            'audio': t.get('audio'),
            'shareurl': t.get('shareurl')
        })
    return jsonify({'tracks': tracks})


@app.route('/api/media/proxy')
def media_proxy():
    """Proxy selected Pixabay/Jamendo media through Flask so the browser can
    safely draw images to canvas, play audio previews, and route music into
    a recorded video without running into cross-origin/referrer issues."""
    target = request.args.get('url', '').strip()
    if not target.startswith('https://'):
        return jsonify({'error': 'Invalid media URL.'}), 400

    try:
        host = urllib.parse.urlparse(target).hostname or ''
        allowed = host == 'pixabay.com' or host.endswith('.pixabay.com') \
            or host == 'jamendo.com' or host.endswith('.jamendo.com')
        if not allowed:
            return jsonify({'error': 'Media host is not allowed.'}), 403

        req = urllib.request.Request(target, headers={'User-Agent': REQUEST_USER_AGENT})
        with urllib.request.urlopen(req, timeout=15) as response:
            data = response.read()
            content_type = response.headers.get('Content-Type', 'application/octet-stream')
        return Response(data, content_type=content_type,
                        headers={'Cache-Control': 'public, max-age=3600'})
    except Exception as exc:
        return jsonify({'error': f'Could not load media: {exc}'}), 502


if __name__ == '__main__':
    app.run(debug=True)
