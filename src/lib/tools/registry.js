import {
  Palette,
  Sparkles,
  PenTool,
  Film,
  Image,
  Layers,
  Video,
  SquareCode
} from '@lucide/svelte';

// Tools components
import GradientGenerator from './css/gradient-generator/Tool.svelte';
import BoxShadowGenerator from './css/box-shadow-generator/Tool.svelte';
import ColorTools from './css/color-tools/Tool.svelte';
import GsapPlayground from './animation/gsap-playground/Tool.svelte';
import SvgPathEditor from './svg/svg-path-editor/Tool.svelte';
import FrameExtractor from './video/frame-extractor/Tool.svelte';
import YoutubeDownloader from './video/youtube-downloader/Tool.svelte';
import ImageCompressor from './image/image-compressor/Tool.svelte';

export const categories = [
  { id: 'all', label: 'All Tools', icon: Layers, description: 'Explore the full suite of frontend animation, 3D & styling utilities' },
  { id: 'video', label: 'Video Studio', icon: Film, description: 'High-speed frame extraction, stream downloads & media tools' },
  { id: 'image', label: 'Image Studio', icon: Image, description: 'Client-side compression, format conversion and asset optimization' },
  { id: 'css', label: 'CSS & Styling', icon: Palette, description: 'Visual gradient designers, multi-layer shadows and harmonic color palettes' },
  { id: 'animation', label: 'Motion & GSAP', icon: Sparkles, description: 'Interactive GSAP timeline sandbox, easing visualizer and presets' },
  { id: 'svg', label: 'SVG & Vectors', icon: PenTool, description: 'Visual SVG path coordinate inspector and clean vector markup generator' }
];

export const toolRegistry = [
  {
    id: 'gsap-playground',
    name: 'GSAP Playground',
    description: 'Interactive timeline animator with easing visualizer and code exporter',
    category: 'animation',
    icon: Sparkles,
    tags: ['gsap', 'animation', 'timeline', 'easing', 'motion', 'interactive'],
    component: GsapPlayground
  },
  {
    id: 'frame-extractor',
    name: 'Video Frame Extractor',
    description: 'Extract high-resolution image frames at exact timestamps or intervals',
    category: 'video',
    icon: Film,
    tags: ['video', 'frames', 'extract', 'capture', 'export', 'png'],
    component: FrameExtractor
  },
  {
    id: 'gradient-generator',
    name: 'CSS Gradient Generator',
    description: 'Linear, radial & conic multi-stop gradient builder with code export',
    category: 'css',
    icon: Palette,
    tags: ['css', 'gradient', 'linear', 'radial', 'conic', 'background'],
    component: GradientGenerator
  },
  {
    id: 'box-shadow-generator',
    name: 'Box Shadow Generator',
    description: 'Multi-layer elevation builder with inset support and real-time preview',
    category: 'css',
    icon: Layers,
    tags: ['css', 'shadow', 'box-shadow', 'elevation', 'depth'],
    component: BoxShadowGenerator
  },
  {
    id: 'color-tools',
    name: 'Color Palette & Harmony',
    description: 'Color conversions, harmonic palette generation, and WCAG contrast check',
    category: 'css',
    icon: Palette,
    tags: ['color', 'palette', 'harmony', 'wcag', 'contrast', 'hex', 'rgb', 'hsl'],
    component: ColorTools
  },
  {
    id: 'svg-path-editor',
    name: 'SVG Path Editor',
    description: 'Visual SVG path inspector, curve adjustments, and clean markup generator',
    category: 'svg',
    icon: PenTool,
    tags: ['svg', 'path', 'vector', 'curves', 'shapes', 'd-attribute'],
    component: SvgPathEditor
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor & Resizer',
    description: 'Compress PNG, JPG, WebP with custom dimensions and savings comparison',
    category: 'image',
    icon: Image,
    tags: ['image', 'compress', 'optimize', 'resize', 'webp', 'jpg', 'png'],
    component: ImageCompressor
  },
  {
    id: 'youtube-downloader',
    name: 'YouTube Downloader',
    description: 'Download video & audio streams with format and resolution selection',
    category: 'video',
    icon: Video,
    tags: ['youtube', 'video', 'download', 'yt-dlp', 'mp4', 'mp3'],
    component: YoutubeDownloader
  }
];

export function getToolById(id) {
  return toolRegistry.find(t => t.id === id) || toolRegistry[0];
}
