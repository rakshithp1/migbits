import { communitySources } from "../../catalog/community";
import Link from "next/link";
﻿import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductHeader } from "../components/product-header";
import { LibraryBrowser } from "./library-browser";
export const metadata: Metadata = { title: "Library preview | Migbits", description: "Explore Migbits' first original settings workflow and its declared compatibility and state behavior.", robots: { index: false, follow: true } };
export default function LibraryPage() { return <div className="product-shell"><ProductHeader/><main className="product-main"><div className="development-notice"><span/> DEVELOPMENT CATALOG <span className="notice-copy">Draft resources. Public beta gates are still open.</span></div><div className="library-intro"><div><p className="eyebrow">FIND YOUR NEXT STARTING POINT</p><h1>Good interfaces.<br/><span>Thoughtful details.</span></h1></div><p>Original resources for the way you build.<br/>Explore the first workflow. Inspect every state.</p></div><Link href="/open-source" className="library-community-callout"><div><span>THE OPEN-SOURCE COLLECTION</span><strong>{communitySources.length} verified projects. 19 components ready to try.</strong></div><span>Explore the collection &#8599;</span></Link><Suspense fallback={<p className="catalog-loading">Loading library controls...</p>}><LibraryBrowser/></Suspense></main><footer className="product-footer">Migbits / A working foundation, one resource at a time.<Link href="/">Back to the playground &#8599;</Link></footer></div>; }
