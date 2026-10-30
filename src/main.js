import './styles.css';
import { Editor } from './canvas/editor.js';
import { TRADITIONAL_COLORS } from './data/colors.js';
import { DECORATIONS, decorationToSvgString } from './data/decorations.js';
import { TEMPLATES, CANVAS_PRESETS } from './data/templates.js';
import { generateSealSvg } from './seal/generator.js';

const app = document.getElementById('app');

app.innerHTML = `
  <header class="topbar">
    <div class="brand">
      <span class="brand-name">墨画</span>
      <span class="brand-sub">国风设计</span>
    </div>
    <div class="divider"></div>
    <button class="btn" data-action="undo" title="撤销">撤销</button>
    <button class="btn" data-action="redo" title="重做">重做</button>
    <div class="divider"></div>
    <button class="btn" data-action="save" title="保存到本地">保存</button>
    <button class="btn" data-action="load" title="读取本地">读取</button>
    <button class="btn desktop-only" data-action="export-json">导出JSON</button>
    <button class="btn desktop-only" data-action="import-json">导入JSON</button>
    <button class="btn gold" data-action="export-png">导出PNG</button>
    <input type="file" id="file-image" accept="image/*" hidden />
    <input type="file" id="file-json" accept="application/json,.json" hidden />
  </header>
  <div class="workspace">
    <aside class="sidebar" id="sidebar">
      <div class="panel-tabs">
        <button class="panel-tab active" data-panel="tools">工具</button>
        <button class="panel-tab" data-panel="colors">传统色</button>
        <button class="panel-tab" data-panel="decos">装饰</button>
        <button class="panel-tab" data-panel="tpls">模板</button>
        <button class="panel-tab" data-panel="seal">印章</button>
      </div>
      <div class="panel-body" id="panel-tools">
        <div class="panel-section">
          <h3>添加元素</h3>
          <div class="tool-grid">
            <button class="tool-btn" data-tool="text"><span class="icon">字</span>文字</button>
            <button class="tool-btn" data-tool="rect"><span class="icon">▢</span>矩形</button>
            <button class="tool-btn" data-tool="circle"><span class="icon">○</span>圆形</button>
            <button class="tool-btn" data-tool="line"><span class="icon">／</span>线条</button>
            <button class="tool-btn" data-tool="image"><span class="icon">图</span>图片</button>
            <button class="tool-btn" data-tool="delete"><span class="icon">删</span>删除</button>
          </div>
        </div>
        <div class="panel-section">
          <h3>图层</h3>
          <div class="tool-grid" style="grid-template-columns:1fr 1fr">
            <button class="tool-btn" data-tool="forward"><span class="icon">↑</span>上移</button>
            <button class="tool-btn" data-tool="backward"><span class="icon">↓</span>下移</button>
          </div>
        </div>
      </div>
      <div class="panel-body hidden" id="panel-colors">
        <div class="panel-section">
          <h3>中国传统色</h3>
          <div class="color-grid" id="color-grid"></div>
        </div>
        <div class="panel-section">
          <h3>画布背景</h3>
          <div class="prop-row">
            <label>背景</label>
            <input type="color" id="bg-color" value="#fffbf0" />
          </div>
        </div>
      </div>
      <div class="panel-body hidden" id="panel-decos">
        <div class="panel-section">
          <h3>国风装饰</h3>
          <div class="deco-grid" id="deco-grid"></div>
        </div>
      </div>
      <div class="panel-body hidden" id="panel-tpls">
        <div class="panel-section">
          <h3>就绪模板</h3>
          <div class="tpl-list" id="tpl-list"></div>
        </div>
      </div>
      <div class="panel-body hidden" id="panel-seal">
        <div class="panel-section">
          <h3>印章生成</h3>
          <div class="seal-form">
            <input type="text" id="seal-text" maxlength="4" placeholder="输入2-4字" value="墨画" />
            <div class="seal-preview" id="seal-preview"></div>
            <button class="btn" style="background:var(--accent);color:#fff;border:none" data-action="add-seal">添加到画布</button>
            <p class="prop-hint" style="padding:4px 0">传统朱文印风格，输入姓名或雅号</p>
          </div>
        </div>
      </div>
    </aside>

    <div class="canvas-area">
      <div class="canvas-toolbar">
        <label>尺寸</label>
        <select id="preset-size">
          ${CANVAS_PRESETS.map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
        <button class="btn btn-icon" data-action="zoom-out" style="background:#5c4033;color:#f5e6c8">－</button>
        <span class="zoom-label" id="zoom-label">40%</span>
        <button class="btn btn-icon" data-action="zoom-in" style="background:#5c4033;color:#f5e6c8">＋</button>
        <button class="btn btn-icon" data-action="zoom-fit" style="background:#5c4033;color:#f5e6c8">适应</button>
      </div>
      <div class="canvas-wrap" id="canvas-wrap">
        <div class="canvas-stage">
          <canvas id="c"></canvas>
        </div>
      </div>
      <div class="drawer-overlay" id="drawer-overlay"></div>
    </div>

    <aside class="props-panel" id="props-panel">
      <div class="panel-tabs">
        <button class="panel-tab active" style="pointer-events:none">属性</button>
      </div>
      <div class="panel-body" id="props-body">
        <p class="prop-hint">选中画布中的元素<br/>以编辑颜色、字号、透明度</p>
      </div>
    </aside>
  </div>
  <nav class="mobile-bar">
    <button data-mobile="tools" class="active"><span class="ico">笔</span>工具</button>
    <button data-mobile="colors"><span class="ico">色</span>色盘</button>
    <button data-mobile="decos"><span class="ico">纹</span>装饰</button>
    <button data-mobile="tpls"><span class="ico">模</span>模板</button>
    <button data-mobile="props"><span class="ico">调</span>属性</button>
  </nav>
  <div class="toast" id="toast"></div>
`;

// —— 初始化编辑器 ——
const canvasEl = document.getElementById('c');
const editor = new Editor(canvasEl, {
  width: 1080,
  height: 1080,
  onChange: syncChrome,
  onSelection: renderProps,
});

// 默认缩放适应视口
fitZoom();


function syncPresetSelect(w, h) {
  const sel = document.getElementById('preset-size');
  const match = CANVAS_PRESETS.find((p) => p.width === w && p.height === h);
  if (match) {
    sel.value = match.id;
    return;
  }
  // Fallback: temporary option reflecting custom size
  let opt = sel.querySelector('option[data-custom="1"]');
  if (!opt) {
    opt = document.createElement('option');
    opt.dataset.custom = '1';
    sel.appendChild(opt);
  }
  opt.value = `custom-${w}x${h}`;
  opt.textContent = `自定义 ${w}×${h}`;
  sel.value = opt.value;
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function syncChrome() {
  document.getElementById('zoom-label').textContent = Math.round(editor.zoom * 100) + '%';
  const undoBtn = document.querySelector('[data-action="undo"]');
  const redoBtn = document.querySelector('[data-action="redo"]');
  if (undoBtn) undoBtn.disabled = !editor.canUndo();
  if (redoBtn) redoBtn.disabled = !editor.canRedo();
}

function fitZoom() {
  const wrap = document.getElementById('canvas-wrap');
  const pad = 48;
  const availW = Math.max(200, wrap.clientWidth - pad);
  const availH = Math.max(200, wrap.clientHeight - pad);
  const z = Math.min(availW / editor.width, availH / editor.height, 1);
  editor.setZoom(Math.max(0.1, z * 0.95));
}

function renderProps(obj) {
  const body = document.getElementById('props-body');
  if (!obj) {
    body.innerHTML = `<p class="prop-hint">选中画布中的元素<br/>以编辑颜色、字号、透明度</p>`;
    return;
  }
  const isText = obj.type === 'i-text' || obj.type === 'text' || obj.isType?.('i-text');
  const isLine = obj.type === 'line' || obj.isType?.('line');
  const fill = isLine ? obj.stroke || '#2c1810' : obj.fill || '#2c1810';
  const fillStr = typeof fill === 'string' ? fill : '#2c1810';
  body.innerHTML = `
    <div class="panel-section">
      <h3>外观</h3>
      <div class="prop-row">
        <label>${isLine ? '描边' : '填充'}</label>
        <input type="color" id="prop-fill" value="${toHex(fillStr)}" />
      </div>
      <div class="prop-row">
        <label>透明</label>
        <input type="range" id="prop-opacity" min="0" max="100" value="${Math.round((obj.opacity ?? 1) * 100)}" />
        <span id="prop-opacity-val">${Math.round((obj.opacity ?? 1) * 100)}%</span>
      </div>
      ${
        isText
          ? `<div class="prop-row">
        <label>字号</label>
        <input type="number" id="prop-fontsize" min="8" max="400" value="${obj.fontSize || 48}" />
      </div>`
          : ''
      }
    </div>
    <div class="panel-section">
      <h3>操作</h3>
      <div class="tool-grid" style="grid-template-columns:1fr 1fr">
        <button class="tool-btn" data-tool="forward"><span class="icon">↑</span>上移</button>
        <button class="tool-btn" data-tool="backward"><span class="icon">↓</span>下移</button>
        <button class="tool-btn" data-tool="delete"><span class="icon">删</span>删除</button>
      </div>
    </div>
  `;
  body.querySelector('#prop-fill')?.addEventListener('input', (e) => {
    editor.updateActive({ fill: e.target.value });
  });
  body.querySelector('#prop-opacity')?.addEventListener('input', (e) => {
    const v = Number(e.target.value) / 100;
    document.getElementById('prop-opacity-val').textContent = e.target.value + '%';
    editor.updateActive({ opacity: v });
  });
  body.querySelector('#prop-fontsize')?.addEventListener('change', (e) => {
    editor.updateActive({ fontSize: Number(e.target.value) });
  });
}

function toHex(c) {
  if (!c || typeof c !== 'string') return '#2c1810';
  if (c.startsWith('#') && c.length >= 7) return c.slice(0, 7);
  if (c.startsWith('rgb')) {
    const m = c.match(/\d+/g);
    if (m && m.length >= 3) {
      return (
        '#' +
        m
          .slice(0, 3)
          .map((n) => Number(n).toString(16).padStart(2, '0'))
          .join('')
      );
    }
  }
  return '#2c1810';
}

// —— 填充色盘 ——
const colorGrid = document.getElementById('color-grid');
TRADITIONAL_COLORS.forEach((c) => {
  const btn = document.createElement('button');
  btn.className = 'color-swatch';
  btn.title = `${c.name} ${c.hex}`;
  btn.innerHTML = `<span class="chip" style="background:${c.hex}"></span><span class="label">${c.name}</span>`;
  btn.addEventListener('click', () => {
    colorGrid.querySelectorAll('.color-swatch').forEach((el) => el.classList.remove('selected'));
    btn.classList.add('selected');
    const active = editor.getActive();
    if (active) {
      editor.updateActive({ fill: c.hex });
      renderProps(editor.getActive());
    } else {
      editor.setBackground(c.hex);
      document.getElementById('bg-color').value = c.hex;
      toast(`背景已设为「${c.name}」`);
    }
  });
  colorGrid.appendChild(btn);
});

document.getElementById('bg-color').addEventListener('input', (e) => {
  editor.setBackground(e.target.value);
});

// —— 装饰 ——
const decoGrid = document.getElementById('deco-grid');
DECORATIONS.forEach((d) => {
  const btn = document.createElement('button');
  btn.className = 'deco-item';
  btn.innerHTML = `${decorationToSvgString(d, 80)}<div class="name">${d.name}</div>`;
  btn.addEventListener('click', async () => {
    await editor.addDecoration(d.id);
    toast(`已添加「${d.name}」`);
    closeDrawers();
  });
  decoGrid.appendChild(btn);
});

// —— 模板 ——
const tplList = document.getElementById('tpl-list');
const tplIcons = { chunjie: '春', mingpian: '名', pengyouquan: '圈', zhongqiu: '月', 'baoxian-jieri': '保', 'baoxian-kepu': '知' };
TEMPLATES.forEach((t) => {
  const btn = document.createElement('button');
  btn.className = 'tpl-item';
  btn.innerHTML = `
    <div class="tpl-thumb">${tplIcons[t.id] || '墨'}</div>
    <div class="tpl-meta">
      <div class="name">${t.name}</div>
      <div class="size">${t.width}×${t.height}</div>
    </div>`;
  btn.addEventListener('click', async () => {
    await editor.loadTemplate(t);
    syncPresetSelect(t.width, t.height);
    fitZoom();
    toast(`已加载模板「${t.name}」`);
    closeDrawers();
  });
  tplList.appendChild(btn);
});

// —— 印章预览 ——
function refreshSealPreview() {
  const text = document.getElementById('seal-text').value.trim();
  const box = document.getElementById('seal-preview');
  if (text.length < 2) {
    box.innerHTML = '<span style="color:#999;font-size:12px">请输入2-4个汉字</span>';
    return;
  }
  const svg = generateSealSvg(text, { size: 160 });
  box.innerHTML = svg || '';
}
document.getElementById('seal-text').addEventListener('input', refreshSealPreview);
refreshSealPreview();

// —— 面板切换 ——
document.querySelectorAll('.panel-tab[data-panel]').forEach((tab) => {
  tab.addEventListener('click', () => {
    const id = tab.dataset.panel;
    document.querySelectorAll('.panel-tab[data-panel]').forEach((t) => t.classList.toggle('active', t === tab));
    ['tools', 'colors', 'decos', 'tpls', 'seal'].forEach((p) => {
      document.getElementById('panel-' + p).classList.toggle('hidden', p !== id);
    });
  });
});

// —— 工具 ——
document.addEventListener('click', async (e) => {
  const toolBtn = e.target.closest('[data-tool]');
  if (toolBtn) {
    const tool = toolBtn.dataset.tool;
    if (tool === 'text') editor.addText();
    else if (tool === 'rect') editor.addRect();
    else if (tool === 'circle') editor.addCircle();
    else if (tool === 'line') editor.addLine();
    else if (tool === 'image') document.getElementById('file-image').click();
    else if (tool === 'delete') {
      editor.deleteSelected();
      toast('已删除');
    } else if (tool === 'forward') {
      editor.bringForward();
      toast('已上移');
    } else if (tool === 'backward') {
      editor.sendBackward();
      toast('已下移');
    }
    return;
  }

  const actionBtn = e.target.closest('[data-action]');
  if (!actionBtn) return;
  const action = actionBtn.dataset.action;
  if (action === 'undo') await editor.undo();
  else if (action === 'redo') await editor.redo();
  else if (action === 'zoom-in') editor.zoomIn();
  else if (action === 'zoom-out') editor.zoomOut();
  else if (action === 'zoom-fit') fitZoom();
  else if (action === 'save') {
    editor.saveLocal();
    toast('已保存到本地');
  } else if (action === 'load') {
    const ok = await editor.loadLocal();
    toast(ok ? '已读取本地设计' : '暂无保存的设计');
    if (ok) fitZoom();
  } else if (action === 'export-png') {
    const url = editor.exportPNG();
    downloadDataUrl(url, `墨画-${Date.now()}.png`);
    toast('PNG 已导出');
  } else if (action === 'export-json') {
    const blob = new Blob([editor.exportJSON()], { type: 'application/json' });
    downloadBlob(blob, `墨画-${Date.now()}.json`);
    toast('JSON 已导出');
  } else if (action === 'import-json') {
    document.getElementById('file-json').click();
  } else if (action === 'add-seal') {
    const text = document.getElementById('seal-text').value.trim();
    if (text.length < 2 || text.length > 4) {
      toast('请输入 2–4 个汉字');
      return;
    }
    await editor.addSeal(text);
    toast('印章已添加');
    closeDrawers();
  }
});

document.getElementById('file-image').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  await editor.addImageFromFile(file);
  toast('图片已添加');
});

document.getElementById('file-json').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  const text = await file.text();
  await editor.importJSON(text);
  fitZoom();
  toast('JSON 已导入');
});

document.getElementById('preset-size').addEventListener('change', (e) => {
  const p = CANVAS_PRESETS.find((x) => x.id === e.target.value);
  if (!p) return;
  editor.setSize(p.width, p.height);
  fitZoom();
  toast(`画布：${p.name}`);
});

// —— 移动端抽屉 ——
function closeDrawers() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('props-panel').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('show');
  document.querySelectorAll('.mobile-bar button').forEach((b) => b.classList.remove('active'));
}

document.getElementById('drawer-overlay').addEventListener('click', closeDrawers);

document.querySelectorAll('.mobile-bar button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const which = btn.dataset.mobile;
    const sidebar = document.getElementById('sidebar');
    const props = document.getElementById('props-panel');
    const overlay = document.getElementById('drawer-overlay');

    if (which === 'props') {
      const opening = !props.classList.contains('open');
      closeDrawers();
      if (opening) {
        props.classList.add('open');
        overlay.classList.add('show');
        btn.classList.add('active');
      }
      return;
    }

    const opening = !(sidebar.classList.contains('open') && btn.classList.contains('active'));
    closeDrawers();
    if (opening) {
      sidebar.classList.add('open');
      overlay.classList.add('show');
      btn.classList.add('active');
      // 切到对应面板
      const tab = document.querySelector(`.panel-tab[data-panel="${which}"]`);
      tab?.click();
    }
  });
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return;
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) editor.redo();
    else editor.undo();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
    e.preventDefault();
    editor.redo();
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (editor.getActive()) {
      e.preventDefault();
      editor.deleteSelected();
    }
  }
});

window.addEventListener('resize', () => {
  // 不强制每次都 fit，避免打断用户缩放
});

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// 启动提示
syncChrome();
toast('欢迎使用墨画 · 国风设计');

// 暴露给测试
window.__mohua = { editor, TEMPLATES, DECORATIONS, TRADITIONAL_COLORS };
