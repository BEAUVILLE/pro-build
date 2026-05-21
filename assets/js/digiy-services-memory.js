/*
  DIGIYLYFE — Mémoire locale Mes services
  Code interne : BUILD
  Langage visible : Mes services
  Rôle : brouillons, demandes, devis, notes, fiche.
  Local robuste d'abord, Supabase ensuite.
*/
(function(){
  "use strict";
  const ROOT="DIGIY_SERVICES_MEMORY_V1";
  const MODULE="BUILD";

  function safeStorage(kind){
    try{
      const s = kind === "session" ? sessionStorage : localStorage;
      const k = ROOT + "_TEST";
      s.setItem(k,"1"); s.removeItem(k);
      return s;
    }catch(_){return null;}
  }
  const local=safeStorage("local"), session=safeStorage("session");

  function readRaw(k){try{return (session&&session.getItem(k))||(local&&local.getItem(k))||""}catch(_){return ""}}
  function writeRaw(k,v,opts){try{(opts&&opts.session?session:local).setItem(k,String(v??""));return true}catch(_){return false}}
  function readJson(k,f){const r=readRaw(k); if(!r) return f; try{return JSON.parse(r)??f}catch(_){return f}}
  function writeJson(k,v,opts){try{return writeRaw(k,JSON.stringify(v),opts)}catch(_){return false}}
  function normPhone(v){const d=String(v||"").replace(/[^\d]/g,""); if(!d) return ""; if(d.length===9) return "221"+d; return d.slice(0,15)}
  function normSlug(v){return String(v||"").trim().toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"").replace(/-+/g,"-").replace(/^-|-$/g,"")}

  function sessionHint(){
    let bridge={};
    try{
      if(window.DIGIY_MODULE_BRIDGE?.readSession) bridge=window.DIGIY_MODULE_BRIDGE.readSession()||{};
      else if(window.DIGIY_MODULE_BRIDGE?.getSession) bridge=window.DIGIY_MODULE_BRIDGE.getSession()||{};
    }catch(_){}
    return {
      module: MODULE,
      slug: normSlug(bridge.slug || bridge.workspace_slug || readRaw("digiy_build_slug") || readRaw("digiy_services_slug")),
      phone: normPhone(bridge.phone || bridge.tel || readRaw("digiy_build_phone") || readRaw("digiy_services_phone"))
    };
  }

  function rememberSession(data){
    const d=data||{};
    const slug=normSlug(d.slug||d.workspace_slug||"");
    const phone=normPhone(d.phone||d.tel||"");
    if(slug){writeRaw("digiy_build_slug",slug);writeRaw("digiy_services_slug",slug);}
    if(phone){writeRaw("digiy_build_phone",phone);writeRaw("digiy_services_phone",phone);}
    return sessionHint();
  }

  function loadDraft(){return readJson(ROOT+"_draft",{})}
  function saveDraft(v){const p={...(v||{}),updated_at:new Date().toISOString()};writeJson(ROOT+"_draft",p);return p}
  function loadProfile(){return readJson(ROOT+"_profile",{})}
  function saveProfile(v){const p={...(v||{}),phone:normPhone(v?.phone||""),updated_at:new Date().toISOString()};writeJson(ROOT+"_profile",p);return p}

  function notes(){const a=readJson(ROOT+"_notes",[]); return Array.isArray(a)?a:[]}
  function addNote(text,meta){
    const t=String(text||"").trim();
    if(!t) return null;
    const n={id:"services_note_"+Date.now(),text:t,meta:meta||{},created_at:new Date().toISOString()};
    const a=notes(); a.unshift(n); writeJson(ROOT+"_notes",a.slice(0,200)); return n;
  }

  function requests(){const a=readJson(ROOT+"_requests",[]); return Array.isArray(a)?a:[]}
  function upsertRequest(req){
    const item={id:req?.id||("services_request_"+Date.now()),...(req||{}),updated_at:new Date().toISOString()};
    const a=requests().filter(x=>String(x?.id)!==String(item.id)); a.unshift(item);
    writeJson(ROOT+"_requests",a.slice(0,300)); return item;
  }

  function quotes(){const a=readJson(ROOT+"_quotes",[]); return Array.isArray(a)?a:[]}
  function upsertQuote(q){
    const item={id:q?.id||("services_quote_"+Date.now()),...(q||{}),updated_at:new Date().toISOString()};
    const a=quotes().filter(x=>String(x?.id)!==String(item.id)); a.unshift(item);
    writeJson(ROOT+"_quotes",a.slice(0,300)); return item;
  }

  function clearLocal(){
    [ROOT+"_draft",ROOT+"_notes",ROOT+"_requests",ROOT+"_quotes"].forEach(k=>{try{localStorage.removeItem(k);sessionStorage.removeItem(k)}catch(_){}});
    return true;
  }

  window.DIGIY_SERVICES_MEMORY={
    version:"services-memory-20260521",
    sessionHint, rememberSession,
    loadDraft, saveDraft,
    loadProfile, saveProfile,
    notes, addNote,
    requests, upsertRequest,
    quotes, upsertQuote,
    clearLocal
  };
})();
