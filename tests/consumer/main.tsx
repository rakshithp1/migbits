import { createRoot } from "react-dom/client";
import ProfileSettingsExample from "./migbits/example";
const root=document.getElementById("root");
if(root)createRoot(root).render(<div style={{background:"#f8fafc",color:"#0f172a",padding:24,borderRadius:24}}><ProfileSettingsExample/></div>);
