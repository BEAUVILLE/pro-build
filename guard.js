/*
  DIGIY BUILD — guard.js simple
  Rôle : protéger les pages PRO BUILD avec une session locale 8h.
  Ne gère pas QR, fiche publique, abonnement, triggers ou profil public.
*/
(function(){
  "use strict";

  const MODULE = "BUILD";
  const LOGIN_URL = window.DIGIY_LOGIN_URL || "./pin.html";
  const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

  const SESSION_KEYS = [
    "DIGIY_BUILD_ACCESS",
    "DIGIY_PRO_BUILD_ACCESS",
    "DIGIY_ACCESS",
    "DIGIY_MODULE_ACCESS"
  ];

  const SLUG_KEYS = [
    "DIGIY_BUILD_SLUG",
    "DIGIY_CURRENT_SLUG",
    "DIGIY_PRO_SLUG",
    "DIGIY_SLUG",
    "digiy_build_slug",
    "digiy_slug",
    "slug"
  ];

  const SENSITIVE_KEYS = [
    "phone","tel","p_phone","owner_phone","owner_id","whatsapp","msisdn",
    "pin","pin4","token","session_token","access_token","module","return",
    "redirect","redirect_url","url","from","v"
  ];

  function normalizeSlug(value){
    return String(value || "")
      .trim()
      .replace(/^['"]+|['"]+$/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");
  }

  function moduleLooksBuild(value){
    const m = String(value || "").trim().toUpperCase().replace(/[-\s]/g, "_");
    return m === "BUILD" || m === "PRO_BUILD" || m === "BATISSEUR" || m === "BÂTISSEUR" || m === "PRO_BATISSEUR";
  }

  function readRaw(storage, key){
    try{ return storage.getItem(key); }catch(_){ return null; }
  }

  function readJson(storage, key){
    try{ return JSON.parse(readRaw(storage, key) || "null"); }catch(_){ return null; }
  }

  function writeBoth(key, value){
    try{ localStorage.setItem(key, value); }catch(_){}
    try{ sessionStorage.setItem(key, value); }catch(_){}
  }

  function rememberSlugFromUrl(){
    try{
      const u = new URL(location.href);
      const slug = normalizeSlug(
        u.searchParams.get("slug") ||
        u.searchParams.get("s") ||
        u.searchParams.get("pro") ||
        u.searchParams.get("id") ||
        u.searchParams.get("build") ||
        ""
      );

      if(slug){
        writeBoth("DIGIY_BUILD_SLUG", slug);
        writeBoth("DIGIY_CURRENT_SLUG", slug);
        writeBoth("digiy_build_slug", slug);
      }

      let changed = false;
      [...SENSITIVE_KEYS, "slug", "s", "pro", "id", "build"].forEach(k => {
        if(u.searchParams.has(k)){
          u.searchParams.delete(k);
          changed = true;
        }
      });

      if(changed) history.replaceState({}, document.title, u.pathname + u.search + u.hash);
      return slug;
    }catch(_){
      return "";
    }
  }

  function getStoredSlug(){
    for(const storage of [sessionStorage, localStorage]){
      for(const key of SLUG_KEYS){
        const raw = readRaw(storage, key);
        const direct = normalizeSlug(raw);
        if(direct && direct !== "null" && direct !== "undefined") return direct;

        const parsed = readJson(storage, key);
        const nested = normalizeSlug(parsed?.slug || parsed?.pro_slug || parsed?.build_slug);
        if(nested) return nested;
      }
    }
    return "";
  }

  function getSession(){
    for(const storage of [sessionStorage, localStorage]){
      for(const key of SESSION_KEYS){
        const session = readJson(storage, key);
        if(!session) continue;

        const slug = normalizeSlug(session.slug || session.pro_slug || session.build_slug || "");
        const module = session.module || session.pin_module || "";
        const ts = Number(session.ts || session.verified_at || 0);
        const expiresAt = Number(session.expires_at || 0);
        const freshByTs = ts && (Date.now() - ts) < SESSION_TTL_MS;
        const freshByExp = expiresAt && Date.now() < expiresAt;

        if(slug && moduleLooksBuild(module) && (freshByTs || freshByExp)){
          return {
            ok:true,
            access:true,
            access_ok:true,
            module:MODULE,
            slug,
            phone: session.phone || null,
            owner_id: session.owner_id || null,
            ts: ts || Date.now(),
            expires_at: expiresAt || ((ts || Date.now()) + SESSION_TTL_MS),
            source:key
          };
        }
      }
    }

    return {
      ok:false,
      access:false,
      access_ok:false,
      module:MODULE,
      slug:getStoredSlug()
    };
  }

  function login(){
    const slug = getStoredSlug();
    const target = new URL(LOGIN_URL, location.href);
    target.search = "";
    target.hash = "";
    if(slug) target.searchParams.set("slug", slug);
    location.replace(target.toString());
  }

  const state = getSession();
  const readyPromise = Promise.resolve(state);

  window.DIGIY_GUARD = {
    module: MODULE,
    state,
    ready: () => readyPromise,
    getSession: () => getSession(),
    require: () => {
      const s = getSession();
      if(!s.ok) login();
      return s;
    },
    logout: () => {
      [...SESSION_KEYS, ...SLUG_KEYS].forEach(key => {
        try{ localStorage.removeItem(key); }catch(_){}
        try{ sessionStorage.removeItem(key); }catch(_){}
      });
      login();
    }
  };

  rememberSlugFromUrl();

  const filename = (location.pathname.split("/").pop() || "").toLowerCase();
  const isPin = filename === "pin.html" || filename === "pin";
  if(!isPin && !getSession().ok){
    login();
  }
})();


