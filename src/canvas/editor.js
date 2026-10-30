import {
  Canvas,
  Rect,
  Circle,
  Line,
  IText,
  FabricImage,
  FabricObject,
  Path,
  Group,
  loadSVGFromString,
} from 'fabric';
import { decorationToSvgString, DECORATIONS } from '../data/decorations.js';
import { sealToDataUrl } from '../seal/generator.js';

FabricObject.prototype.transparentCorners = false;
FabricObject.prototype.cornerColor = '#c23a2b';
FabricObject.prototype.cornerStyle = 'circle';
FabricObject.prototype.borderColor = '#c23a2b';
FabricObject.prototype.cornerSize = 12;

const FONT_STACK = 'KaiTi, STKaiti, "Kaiti SC", "Songti SC", SimSun, serif';
const STORAGE_KEY = 'mohua-design-v1';

export class Editor {
  constructor(canvasEl, opts = {}) {
    this.width = opts.width || 1080;
    this.height = opts.height || 1080;
    this.zoom = 0.4;
    this.history = [];
    this.historyIndex = -1;
    this._suspendHistory = false;
    this.onChange = opts.onChange || (() => {});
    this.onSelection = opts.onSelection || (() => {});
    this._ready = false;

    this.canvas = new Canvas(canvasEl, {
      width: this.width,
      height: this.height,
      backgroundColor: '#FFFBF0',
      preserveObjectStacking: true,
      selection: true,
      stopContextMenu: true,
    });

    this._bindEvents();
    this.setZoom(this.zoom);
    this._ready = true;
    queueMicrotask(() => {
      if (this.historyIndex < 0) this._pushHistory();
    });
  }

  _bindEvents() {
    const c = this.canvas;
    c.on('selection:created', (e) => this.onSelection(e.selected?.[0] || c.getActiveObject()));
    c.on('selection:updated', (e) => this.onSelection(e.selected?.[0] || c.getActiveObject()));
    c.on('selection:cleared', () => this.onSelection(null));
    c.on('object:modified', () => this._pushHistory());
    c.on('object:added', () => {
      if (!this._suspendHistory) this._pushHistory();
    });
    c.on('object:removed', () => {
      if (!this._suspendHistory) this._pushHistory();
    });
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.setDimensions({ width: w, height: h });
    this.setZoom(this.zoom);
    if (this._ready) this.onChange();
  }

  setZoom(z) {
    this.zoom = Math.min(2, Math.max(0.1, z));
    const c = this.canvas;
    c.setZoom(this.zoom);
    c.setDimensions({
      width: this.width * this.zoom,
      height: this.height * this.zoom,
    });
    c.requestRenderAll();
    if (this._ready) this.onChange();
  }

  zoomIn() {
    this.setZoom(this.zoom * 1.15);
  }

  zoomOut() {
    this.setZoom(this.zoom / 1.15);
  }

  setBackground(color) {
    this.canvas.backgroundColor = color;
    this.canvas.requestRenderAll();
    this._pushHistory();
  }

  addText(text = '双击编辑文字') {
    const t = new IText(text, {
      left: this.width / 2,
      top: this.height / 2,
      fontSize: 48,
      fill: '#2c1810',
      fontFamily: FONT_STACK,
      originX: 'center',
      originY: 'center',
    });
    this.canvas.add(t);
    this.canvas.setActiveObject(t);
    this.canvas.requestRenderAll();
    return t;
  }

  addRect() {
    const r = new Rect({
      left: this.width / 2 - 100,
      top: this.height / 2 - 60,
      width: 200,
      height: 120,
      fill: '#c23a2b',
      opacity: 0.9,
      rx: 4,
      ry: 4,
    });
    this.canvas.add(r);
    this.canvas.setActiveObject(r);
    this.canvas.requestRenderAll();
    return r;
  }

  addCircle() {
    const c = new Circle({
      left: this.width / 2,
      top: this.height / 2,
      radius: 80,
      fill: '#177CB0',
      originX: 'center',
      originY: 'center',
      opacity: 0.9,
    });
    this.canvas.add(c);
    this.canvas.setActiveObject(c);
    this.canvas.requestRenderAll();
    return c;
  }

  addLine() {
    const l = new Line([100, 100, 400, 100], {
      left: this.width / 2 - 150,
      top: this.height / 2,
      stroke: '#2c1810',
      strokeWidth: 4,
    });
    this.canvas.add(l);
    this.canvas.setActiveObject(l);
    this.canvas.requestRenderAll();
    return l;
  }

  async addImageFromFile(file) {
    const url = await readFileAsDataURL(file);
    const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
    const max = Math.min(this.width, this.height) * 0.5;
    const scale = Math.min(max / img.width, max / img.height, 1);
    img.set({
      left: this.width / 2,
      top: this.height / 2,
      originX: 'center',
      originY: 'center',
      scaleX: scale,
      scaleY: scale,
    });
    this.canvas.add(img);
    this.canvas.setActiveObject(img);
    this.canvas.requestRenderAll();
    return img;
  }

  async addDecoration(decorationId) {
    const dec = DECORATIONS.find((d) => d.id === decorationId);
    if (!dec) return null;
    const svg = decorationToSvgString(dec, 200);
    const objects = await loadSvgObjects(svg);
    if (!objects || !objects.length) return null;

    let obj;
    if (objects.length === 1) {
      obj = objects[0];
    } else {
      obj = new Group(objects);
    }
    obj.set({
      left: this.width / 2,
      top: this.height / 2,
      originX: 'center',
      originY: 'center',
      scaleX: 1.5,
      scaleY: 1.5,
    });
    obj.set('dataDecorationId', decorationId);
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.requestRenderAll();
    return obj;
  }

  async addSeal(text) {
    const dataUrl = sealToDataUrl(text, { size: 240 });
    if (!dataUrl) return null;
    const img = await FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' });
    img.set({
      left: this.width / 2,
      top: this.height / 2,
      originX: 'center',
      originY: 'center',
      scaleX: 0.8,
      scaleY: 0.8,
    });
    img.set('dataSealText', text);
    this.canvas.add(img);
    this.canvas.setActiveObject(img);
    this.canvas.requestRenderAll();
    return img;
  }

  deleteSelected() {
    const active = this.canvas.getActiveObjects();
    if (!active.length) return;
    this.canvas.discardActiveObject();
    active.forEach((o) => this.canvas.remove(o));
    this.canvas.requestRenderAll();
  }

  bringForward() {
    const obj = this.canvas.getActiveObject();
    if (!obj) return;
    this.canvas.bringObjectForward(obj);
    this.canvas.requestRenderAll();
    this._pushHistory();
  }

  sendBackward() {
    const obj = this.canvas.getActiveObject();
    if (!obj) return;
    this.canvas.sendObjectBackwards(obj);
    this.canvas.requestRenderAll();
    this._pushHistory();
  }

  updateActive(props) {
    const obj = this.canvas.getActiveObject();
    if (!obj) return;
    if (props.fill != null && obj.set) {
      if (obj.type === 'i-text' || obj.type === 'text' || obj.isType?.('i-text') || obj.isType?.('text')) {
        obj.set('fill', props.fill);
      } else if (obj.type === 'line' || obj.isType?.('line')) {
        obj.set('stroke', props.fill);
      } else {
        obj.set('fill', props.fill);
      }
    }
    if (props.stroke != null) obj.set('stroke', props.stroke);
    if (props.opacity != null) obj.set('opacity', props.opacity);
    if (props.fontSize != null) obj.set('fontSize', props.fontSize);
    if (props.fontFamily != null) obj.set('fontFamily', props.fontFamily);
    obj.setCoords();
    this.canvas.requestRenderAll();
    this._pushHistory();
  }

  async loadTemplate(tpl, addDecorationFn) {
    this._suspendHistory = true;
    this.canvas.clear();
    this.setSize(tpl.width, tpl.height);
    this.canvas.backgroundColor = tpl.background || '#FFFBF0';

    for (const desc of tpl.objects) {
      await this._addFromDesc(desc);
    }

    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this._suspendHistory = false;
    this._pushHistory();
    this.onChange();
  }

  async _addFromDesc(desc) {
    let obj = null;
    if (desc.type === 'text') {
      obj = new IText(desc.text || '', {
        left: desc.left,
        top: desc.top,
        fontSize: desc.fontSize || 36,
        fill: desc.fill || '#2c1810',
        fontFamily: desc.fontFamily || FONT_STACK,
        fontWeight: desc.fontWeight || 'normal',
        originX: desc.originX || 'left',
        originY: desc.originY || 'top',
        opacity: desc.opacity ?? 1,
      });
    } else if (desc.type === 'rect') {
      obj = new Rect({
        left: desc.left,
        top: desc.top,
        width: desc.width,
        height: desc.height,
        fill: desc.fill === 'transparent' ? 'rgba(0,0,0,0)' : desc.fill || '#c23a2b',
        stroke: desc.stroke,
        strokeWidth: desc.strokeWidth || 0,
        opacity: desc.opacity ?? 1,
        rx: desc.rx || 0,
        ry: desc.ry || 0,
      });
    } else if (desc.type === 'circle') {
      obj = new Circle({
        left: desc.left,
        top: desc.top,
        radius: desc.radius || 50,
        fill: desc.fill || '#177CB0',
        originX: desc.originX || 'left',
        originY: desc.originY || 'top',
        opacity: desc.opacity ?? 1,
      });
    } else if (desc.type === 'decoration') {
      const dec = DECORATIONS.find((d) => d.id === desc.decorationId);
      if (!dec) return;
      const svg = decorationToSvgString(dec, 200);
      const objects = await loadSvgObjects(svg);
      if (!objects?.length) return;
      obj = objects.length === 1 ? objects[0] : new Group(objects);
      const scale = desc.scale || 1;
      obj.set({
        left: desc.left,
        top: desc.top,
        scaleX: scale,
        scaleY: scale,
        originX: desc.originX || 'left',
        originY: desc.originY || 'top',
      });
    }
    if (obj) this.canvas.add(obj);
  }

  async _pushHistory() {
    if (this._suspendHistory) return;
    try {
      const json = this.canvas.toJSON();
      json._mohua = { width: this.width, height: this.height };
      const str = JSON.stringify(json);
      // 去重
      if (this.history[this.historyIndex] === str) return;
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(str);
      if (this.history.length > 40) {
        this.history.shift();
      }
      this.historyIndex = this.history.length - 1;
      this.onChange();
    } catch (e) {
      console.warn('history push failed', e);
    }
  }

  async undo() {
    if (this.historyIndex <= 0) return;
    this.historyIndex -= 1;
    await this._loadHistory(this.history[this.historyIndex]);
  }

  async redo() {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex += 1;
    await this._loadHistory(this.history[this.historyIndex]);
  }

  async _loadHistory(str) {
    this._suspendHistory = true;
    const json = JSON.parse(str);
    const w = json._mohua?.width || this.width;
    const h = json._mohua?.height || this.height;
    this.width = w;
    this.height = h;
    await this.canvas.loadFromJSON(json);
    this.canvas.setDimensions({ width: w, height: h });
    this.setZoom(this.zoom);
    this.canvas.requestRenderAll();
    this._suspendHistory = false;
    this.onChange();
    this.onSelection(this.canvas.getActiveObject());
  }

  exportJSON() {
    const json = this.canvas.toJSON();
    json._mohua = { width: this.width, height: this.height, version: 1 };
    return JSON.stringify(json, null, 2);
  }

  async importJSON(str) {
    const json = typeof str === 'string' ? JSON.parse(str) : str;
    this._suspendHistory = true;
    const w = json._mohua?.width || this.width;
    const h = json._mohua?.height || this.height;
    this.width = w;
    this.height = h;
    await this.canvas.loadFromJSON(json);
    this.canvas.backgroundColor = json.background || this.canvas.backgroundColor;
    this.setZoom(this.zoom);
    this.canvas.requestRenderAll();
    this._suspendHistory = false;
    this._pushHistory();
    this.onChange();
  }

  saveLocal() {
    localStorage.setItem(STORAGE_KEY, this.exportJSON());
  }

  async loadLocal() {
    const str = localStorage.getItem(STORAGE_KEY);
    if (!str) return false;
    await this.importJSON(str);
    return true;
  }

  exportPNG() {
    const prevZoom = this.zoom;
    // 以 1:1 导出
    this.canvas.setZoom(1);
    this.canvas.setDimensions({ width: this.width, height: this.height });
    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      multiplier: 1,
      enableRetinaScaling: false,
    });
    this.setZoom(prevZoom);
    return dataUrl;
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  getActive() {
    return this.canvas.getActiveObject();
  }
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function loadSvgObjects(svgString) {
  try {
    const { objects } = await loadSVGFromString(svgString);
    return (objects || []).filter(Boolean);
  } catch (e) {
    console.warn('SVG load failed', e);
    return [];
  }
}

export { FONT_STACK, STORAGE_KEY };
