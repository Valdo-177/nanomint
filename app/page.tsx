import Toolbar from './components/editor/Toolbar';
import TopBar from './components/editor/TopBar';
import Canvas from './components/editor/Canvas';
import PropertiesSidebar from './components/editor/PropertiesSidebar';
import { EditorProvider } from './store/EditorContext';

export default function Home() {
  return (
    <EditorProvider>
      <main className="flex flex-col h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
        <TopBar />

        <div className="flex flex-1 w-full overflow-hidden">
          <Toolbar />
          <Canvas />
          <PropertiesSidebar />
        </div>

        <footer className="h-10 w-full glass-panel border-b-0 border-x-0 flex items-center justify-between px-8 text-[10px] font-bold uppercase tracking-widest text-foreground/20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Engine Status: Ready
            </div>
            <div className="w-px h-3 bg-outline/10" />
            <span>1000 x 700 PX</span>
          </div>
          <div className="flex items-center gap-6">
            <span>© 2024 NanoMint Design</span>
            <div className="w-px h-3 bg-outline/10" />
            <span>v1.0.4-beta</span>
          </div>
        </footer>
      </main>
    </EditorProvider>
  );
}
